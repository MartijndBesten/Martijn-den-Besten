import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = BijbelreisViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

/// De webview van de Bijbelreis: met de rand-veeg van iOS ga je terug (en vooruit). De atlas zet zelf voor elk venster en
/// elke plek een stap in de geschiedenis (history.pushState), dus ‘terug vegen’ sluit eerst een open venster en gaat
/// daarna naar de vorige plek, net als de terugknop van de browser.
class BijbelreisViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        webView?.allowsBackForwardNavigationGestures = true
        #if DEBUG
        // Alleen voor de simulator-test in CI, en alleen met BIJBELREIS_TEST in de omgeving (BijbelreisTest.swift).
        BijbelreisTest.startAlsGevraagd(webView)
        #endif
    }
}
