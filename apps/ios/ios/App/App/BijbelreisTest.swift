#if DEBUG
import UIKit
import WebKit

/// Alleen in DEBUG-builds; de App Store-build (Release) bevat dit bestand niet (`#if DEBUG`).
///
/// Testloper voor de simulator-test in GitHub Actions (`apps/ios/scripts/simulator-test.mjs`). Hij doet alleen iets als
/// de app gestart is met de omgevingsvariabele `BIJBELREIS_TEST=<scenario>` (`SIMCTL_CHILD_BIJBELREIS_TEST` bij
/// `xcrun simctl launch`). Zonder die variabele gebeurt er niets, ook niet in een debug-build.
///
/// Het scenario is een JSON-lijst met stappen in `Documents/test/<scenario>.json` (de test zet hem daar na het
/// installeren). Elke stap: `{ "naam", "js"?, "terug"?, "wacht"?, "foto"?, "ms"? }`
///  - `js`: een async JavaScript-functielichaam in de pagina; geeft hij een tekst terug die met `FOUT` begint, dan mislukt
///    de stap. Een stap die naar een andere pagina gaat, klikt met `setTimeout`, zodat de aanroep eerst terugkomt;
///  - `terug`: `webView.goBack()`, dezelfde actie als de rand-veeg van iOS;
///  - `wacht`: een JavaScript-uitdrukking die binnen `ms` (standaard 15 s) waar moet worden;
///  - `foto`: de test maakt dan een schermafbeelding van het hele scherm (`xcrun simctl io … screenshot`): de app
///    schrijft `Documents/test/foto.txt` met de naam en wacht tot de test dat bestand weghaalt.
/// De uitkomst staat na elke stap in `Documents/test/<scenario>-resultaat.json`, met de JavaScript-fouten van de pagina.
final class BijbelreisTest: NSObject, WKScriptMessageHandler {
    private static var actief: BijbelreisTest?

    private struct Stap: Decodable {
        let naam: String
        let js: String?
        let terug: Bool?
        let wacht: String?
        let foto: String?
        let ms: Double?
    }

    private weak var webView: WKWebView?
    private let naam: String
    private let map: URL
    private var stappen: [Stap] = []
    private var uitkomst: [[String: Any]] = []
    private var paginaFouten: [String] = []

    static func startAlsGevraagd(_ webView: WKWebView?) {
        guard let webView = webView,
              let naam = ProcessInfo.processInfo.environment["BIJBELREIS_TEST"],
              naam.range(of: "^[a-z0-9-]{1,40}$", options: .regularExpression) != nil,
              let documenten = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else { return }
        let test = BijbelreisTest(webView: webView, naam: naam, map: documenten.appendingPathComponent("test"))
        actief = test
        test.begin()
    }

    private init(webView: WKWebView, naam: String, map: URL) {
        self.webView = webView
        self.naam = naam
        self.map = map
        super.init()
    }

    private func begin() {
        guard let webView = webView else { return }
        // Fouten in de pagina verzamelen, op elke pagina (ook na navigeren naar de lesroutes).
        let vanger = """
        (function () {
          const meld = (t) => { try { window.webkit.messageHandlers.bijbelreisTest.postMessage(String(t).slice(0, 500)); } catch (e) {} };
          window.addEventListener("error", (e) => meld("error: " + e.message + " @ " + (e.filename || "") + ":" + (e.lineno || "")));
          window.addEventListener("unhandledrejection", (e) => meld("unhandledrejection: " + (e.reason && e.reason.message || e.reason)));
          const ce = console.error.bind(console);
          console.error = (...a) => { meld("console.error: " + a.map(String).join(" ")); ce(...a); };
        })();
        """
        webView.configuration.userContentController.addUserScript(WKUserScript(source: vanger, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        webView.configuration.userContentController.add(self, name: "bijbelreisTest")
        do {
            let data = try Data(contentsOf: map.appendingPathComponent("\(naam).json"))
            stappen = try JSONDecoder().decode([Stap].self, from: data)
        } catch {
            uitkomst.append(["naam": "scenario laden", "ok": false, "fout": "\(error)"])
            schrijf(klaar: true)
            return
        }
        // De pagina laadt pas na capacitorDidLoad; geef haar een moment.
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { self.voer(0) }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        paginaFouten.append(String(describing: message.body))
    }

    private func voer(_ i: Int) {
        guard i < stappen.count else { schrijf(klaar: true); return }
        let stap = stappen[i]
        let begin = Date()
        let verder: (Bool, String?, Any?) -> Void = { ok, fout, waarde in
            var r: [String: Any] = ["naam": stap.naam, "ok": ok, "ms": Int(Date().timeIntervalSince(begin) * 1000)]
            if let fout = fout { r["fout"] = fout }
            if let waarde = waarde { r["waarde"] = JSONSerialization.isValidJSONObject([waarde]) ? waarde : String(describing: waarde) }
            self.uitkomst.append(r)
            self.schrijf(klaar: false)
            // Een mislukte stap stopt het scenario: de volgende stappen hangen er meestal van af.
            if ok { self.voer(i + 1) } else { self.schrijf(klaar: true) }
        }
        actie(stap) { fout, waarde in
            if let fout = fout { verder(false, fout, waarde); return }
            self.wacht(stap.wacht, tot: Date().addingTimeInterval((stap.ms ?? 15000) / 1000)) { gelukt in
                guard gelukt else { verder(false, "wacht: niet waar binnen de tijd: \(stap.wacht ?? "")", waarde); return }
                guard let foto = stap.foto else { verder(true, nil, waarde); return }
                self.foto(foto) { gelukt in verder(gelukt, gelukt ? nil : "foto: de test reageerde niet", waarde) }
            }
        }
    }

    private func actie(_ stap: Stap, klaar: @escaping (String?, Any?) -> Void) {
        guard let webView = webView else { klaar("geen webview", nil); return }
        if stap.terug == true {
            guard webView.allowsBackForwardNavigationGestures else { klaar("terug vegen staat uit", nil); return }
            guard webView.canGoBack else { klaar("canGoBack is false", nil); return }
            webView.goBack()
            klaar(nil, nil)
            return
        }
        guard let js = stap.js else { klaar(nil, nil); return }
        webView.callAsyncJavaScript(js, arguments: [:], in: nil, in: .page) { resultaat in
            switch resultaat {
            case .success(let waarde):
                if let tekst = waarde as? String, tekst.hasPrefix("FOUT") { klaar(tekst, nil) } else { klaar(nil, waarde) }
            case .failure(let error):
                let e = error as NSError
                klaar("js: \(e.localizedDescription) \(e.userInfo["WKJavaScriptExceptionMessage"] ?? "")", nil)
            }
        }
    }

    private func wacht(_ uitdrukking: String?, tot: Date, klaar: @escaping (Bool) -> Void) {
        guard let uitdrukking = uitdrukking, let webView = webView else { klaar(true); return }
        webView.callAsyncJavaScript("try { return !!(\(uitdrukking)); } catch (e) { return false; }", arguments: [:], in: nil, in: .page) { resultaat in
            if case .success(let waarde) = resultaat, (waarde as? Bool) == true { klaar(true); return }
            if Date() > tot { klaar(false); return }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { self.wacht(uitdrukking, tot: tot, klaar: klaar) }
        }
    }

    private func foto(_ naam: String, klaar: @escaping (Bool) -> Void) {
        let bestand = map.appendingPathComponent("foto.txt")
        // Even rust: animaties en lettertypen.
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            try? naam.write(to: bestand, atomically: true, encoding: .utf8)
            let tot = Date().addingTimeInterval(90)
            func kijk() {
                if !FileManager.default.fileExists(atPath: bestand.path) { klaar(true); return }
                if Date() > tot { klaar(false); return }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2, execute: kijk)
            }
            kijk()
        }
    }

    private func schrijf(klaar: Bool) {
        let alles: [String: Any] = ["scenario": naam, "klaar": klaar, "stappen": uitkomst, "paginaFouten": paginaFouten]
        guard JSONSerialization.isValidJSONObject(alles),
              let data = try? JSONSerialization.data(withJSONObject: alles, options: [.prettyPrinted]) else {
            let noodgeval: [String: Any] = ["scenario": naam, "klaar": klaar, "fout": "uitkomst niet als JSON te schrijven"]
            if let d = try? JSONSerialization.data(withJSONObject: noodgeval) { try? d.write(to: map.appendingPathComponent("\(naam)-resultaat.json")) }
            return
        }
        try? data.write(to: map.appendingPathComponent("\(naam)-resultaat.json"), options: .atomic)
    }
}
#endif
