// Controleert de bestanden van het Xcode-project zo goed als dat zonder Mac kan (plutil en xcodebuild bestaan niet op
// Linux): de plists en storyboards met een XML-parser, project.pbxproj met de parser die Capacitor zelf gebruikt (xcode),
// de instellingen voor de App Store en het pictogram (1024×1024, zonder transparantie).
//
//   npm run controleer        (na npm ci in apps/ios; sharp komt uit de node_modules van de repository)
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import plist from "plist";
import xcode from "xcode";
import xml2js from "xml2js";

const hier = dirname(fileURLToPath(import.meta.url));
const APP = join(hier, "..");
const IOS = join(APP, "ios", "App");
const sharp = createRequire(join(APP, "..", "..", "package.json"))("sharp");

const fouten = [];
const ok = [];
const moet = (waar, wat) => (waar ? ok.push(wat) : fouten.push(wat));

// ---------- plists ----------
const info = plist.parse(readFileSync(join(IOS, "App", "Info.plist"), "utf8"));
moet(info.CFBundleDisplayName === "Bijbelreis", "Info.plist: weergavenaam ‘Bijbelreis’");
moet(info.CFBundleDevelopmentRegion === "nl", "Info.plist: taal nl");
moet(info.CFBundleShortVersionString === "$(MARKETING_VERSION)" && info.CFBundleVersion === "$(CURRENT_PROJECT_VERSION)", "Info.plist: versie en build uit de projectinstellingen");
moet(info.ITSAppUsesNonExemptEncryption === false, "Info.plist: ITSAppUsesNonExemptEncryption = NO (exportcompliance)");
moet(JSON.stringify(info.UIRequiredDeviceCapabilities) === '["arm64"]', "Info.plist: alleen arm64 vereist");
moet(info.UILaunchStoryboardName === "LaunchScreen", "Info.plist: opstartscherm LaunchScreen");
moet(info.UIStatusBarStyle === "UIStatusBarStyleDarkContent", "Info.plist: donkere statusbalktekst (op de lichte kop)");
const telefoon = info.UISupportedInterfaceOrientations || [], ipad = info["UISupportedInterfaceOrientations~ipad"] || [];
moet(telefoon.includes("UIInterfaceOrientationPortrait") && telefoon.length === 3 && !telefoon.includes("UIInterfaceOrientationPortraitUpsideDown"), "Info.plist: iPhone staand en liggend (niet ondersteboven)");
moet(ipad.length === 4, "Info.plist: iPad alle vier de standen (nodig voor multitasking)");
moet(!("NSAppTransportSecurity" in info) && !Object.keys(info).some((k) => /UsageDescription$/.test(k)), "Info.plist: geen netwerkuitzonderingen, geen toestemmingen (camera, locatie, …)");

const pm = plist.parse(readFileSync(join(IOS, "App", "PrivacyInfo.xcprivacy"), "utf8"));
moet(pm.NSPrivacyTracking === false && pm.NSPrivacyTrackingDomains.length === 0 && pm.NSPrivacyCollectedDataTypes.length === 0, "PrivacyInfo: geen tracking, geen verzamelde gegevens");
moet(pm.NSPrivacyAccessedAPITypes.length === 1 && pm.NSPrivacyAccessedAPITypes[0].NSPrivacyAccessedAPIType === "NSPrivacyAccessedAPICategoryUserDefaults" && pm.NSPrivacyAccessedAPITypes[0].NSPrivacyAccessedAPITypeReasons[0] === "CA92.1", "PrivacyInfo: UserDefaults met reden CA92.1 (Preferences)");
plist.parse(readFileSync(join(IOS, "App.xcodeproj", "project.xcworkspace", "xcshareddata", "IDEWorkspaceChecks.plist"), "utf8"));
ok.push("IDEWorkspaceChecks.plist: geldige plist");

// ---------- storyboards ----------
for (const sb of ["LaunchScreen", "Main"]) {
  const x = await xml2js.parseStringPromise(readFileSync(join(IOS, "App", "Base.lproj", sb + ".storyboard"), "utf8"));
  moet(!!x.document, `${sb}.storyboard: geldige XML`);
}
moet(readFileSync(join(IOS, "App", "Base.lproj", "Main.storyboard"), "utf8").includes('customClass="BijbelreisViewController"'), "Main.storyboard: BijbelreisViewController (terug vegen)");
moet(readFileSync(join(IOS, "App", "Base.lproj", "LaunchScreen.storyboard"), "utf8").includes('image="Splash"'), "LaunchScreen.storyboard: toont Splash");

// ---------- project.pbxproj ----------
const proj = xcode.project(join(IOS, "App.xcodeproj", "project.pbxproj")).parseSync();
const doel = Object.values(proj.pbxNativeTargetSection()).find((t) => t && t.name === "App");
moet(!!doel, "project.pbxproj: target ‘App’ gevonden (parser slaagt)");
const lijst = proj.pbxXCConfigurationList()[doel.buildConfigurationList];
const configs = lijst.buildConfigurations.map((c) => proj.pbxXCBuildConfigurationSection()[c.value]);
moet(configs.length === 2 && configs.map((c) => c.name).sort().join() === "Debug,Release", "project.pbxproj: Debug en Release");
for (const c of configs) {
  const b = c.buildSettings, n = c.name;
  moet(b.PRODUCT_BUNDLE_IDENTIFIER === "nl.bijbelreis.app", `${n}: bundle-ID nl.bijbelreis.app`);
  moet(b.MARKETING_VERSION === "1.0.0" && String(b.CURRENT_PROJECT_VERSION) === "1", `${n}: versie 1.0.0 (build 1)`);
  moet(b.CODE_SIGN_STYLE === "Automatic", `${n}: automatische signing`);
  moet(b.DEVELOPMENT_TEAM === '""', `${n}: DEVELOPMENT_TEAM leeg (Martijn kiest zijn team in Xcode)`);
  moet(b.TARGETED_DEVICE_FAMILY === '"1,2"', `${n}: iPhone en iPad`);
  moet(String(b.IPHONEOS_DEPLOYMENT_TARGET) === "16.4", `${n}: minimaal iOS 16.4`);
  moet(b.ASSETCATALOG_COMPILER_APPICON_NAME === "AppIcon", `${n}: pictogram AppIcon`);
  moet(b.INFOPLIST_FILE === "App/Info.plist", `${n}: Info.plist`);
}
// Elk bestand dat het project noemt, bestaat (behalve wat Capacitor bij cap sync maakt).
const DOOR_CAP = new Set(["public", "capacitor.config.json", "config.xml"]);
for (const f of Object.values(proj.pbxFileReferenceSection())) {
  if (!f || typeof f !== "object" || !f.path) continue;
  const pad = String(f.path).replace(/^"|"$/g, "");
  if (DOOR_CAP.has(pad) || f.sourceTree === "BUILT_PRODUCTS_DIR" || /\.app$/.test(pad)) continue;
  const kandidaten = [join(IOS, "App", pad), join(IOS, pad), join(IOS, "..", pad)];
  moet(kandidaten.some(existsSync), `project.pbxproj: ${pad} bestaat`);
}

// ---------- pictogram en opstartscherm ----------
const iconen = JSON.parse(readFileSync(join(IOS, "App", "Assets.xcassets", "AppIcon.appiconset", "Contents.json"), "utf8"));
for (const i of iconen.images) {
  const pad = join(IOS, "App", "Assets.xcassets", "AppIcon.appiconset", i.filename);
  const m = await sharp(pad).metadata();
  const s = await sharp(pad).stats();
  moet(m.format === "png" && m.width === 1024 && m.height === 1024, `pictogram ${i.filename}: PNG 1024×1024`);
  moet(!m.hasAlpha && s.isOpaque, `pictogram ${i.filename}: geen transparantie (geen alfakanaal)`);
}
const splash = JSON.parse(readFileSync(join(IOS, "App", "Assets.xcassets", "Splash.imageset", "Contents.json"), "utf8"));
for (const i of splash.images) moet(existsSync(join(IOS, "App", "Assets.xcassets", "Splash.imageset", i.filename)), `opstartscherm ${i.filename} bestaat`);

// ---------- Capacitor ----------
const cap = JSON.parse(readFileSync(join(APP, "capacitor.config.json"), "utf8"));
moet(cap.appId === "nl.bijbelreis.app" && cap.appName === "Bijbelreis" && cap.webDir === "www", "capacitor.config.json: appId, naam en webmap");
moet(!cap.server || (!cap.server.url && (cap.server.allowNavigation || []).length === 0), "capacitor.config.json: geen server.url en geen allowNavigation (alles uit de app, niets op afstand)");

// ---------- teksten voor App Store Connect ----------
// Limieten van App Store Connect (tekens): naam 30, ondertitel 30, promotietekst 170, beschrijving 4000, trefwoorden 100,
// wat is er nieuw 4000. Apple telt tekens; [...tekst].length telt ook ‘ë’ en ‘–’ als één teken.
const meta = JSON.parse(readFileSync(join(APP, "store", "metadata.nl.json"), "utf8"));
const LIMIET = { naam: 30, ondertitel: 30, promotietekst: 170, beschrijving: 4000, trefwoorden: 100, watIsErNieuw: 4000 };
for (const [k, max] of Object.entries(LIMIET)) {
  const n = [...(meta[k] || "")].length;
  moet(n > 0 && n <= max, `metadata ${k}: ${n} van ${max} tekens`);
}
// Trefwoorden: Apple telt hier bytes (UTF-8), niet tekens.
moet(Buffer.byteLength(meta.trefwoorden, "utf8") <= 100, `metadata trefwoorden: ${Buffer.byteLength(meta.trefwoorden, "utf8")} van 100 bytes`);
// Geen Kids-categorie (besluit 17-11-2026, 13+): ‘voor kinderen’ hoort dan niet in de teksten (richtlijn 2.3.8).
moet(!["naam", "ondertitel", "promotietekst", "beschrijving", "trefwoorden"].some((k) => /voor kinderen|for kids|for children|kinderapp/i.test(meta[k])), "metadata: geen ‘voor kinderen’ (geen Kids-categorie, richtlijn 2.3.8)");
moet(meta.sku === "BIJBELREIS-IOS-2026" && meta.leeftijdsclassificatie === "13+", "metadata: SKU en leeftijd zoals in App Store Connect (BIJBELREIS-IOS-2026, 13+)");
moet(!/\s,|,\s/.test(meta.trefwoorden) && new Set(meta.trefwoorden.split(",")).size === meta.trefwoorden.split(",").length, "metadata trefwoorden: komma’s zonder spaties, geen dubbele");
moet(!meta.trefwoorden.split(",").some((w) => meta.naam.toLowerCase().split(/\s+/).includes(w)), "metadata trefwoorden: herhalen de woorden van de naam niet");
moet(meta.supportUrl === "https://bijbelreis.nl/hulp" && meta.privacyUrl === "https://bijbelreis.nl/privacy", "metadata: support- en privacy-URL");

console.log(ok.map((t) => "ok    " + t).join("\n"));
if (fouten.length) { console.error(fouten.map((t) => "FOUT  " + t).join("\n")); process.exit(1); }
console.log(`\nAlle ${ok.length} controles geslaagd. (Niet gecontroleerd zonder Mac: bouwen, ondertekenen, de simulator.)`);
