// Window defaults for each app. `single` apps only ever have one window;
// `chrome: false` apps draw their own title bar.
export const APP_INFO = {
  finder: { name: "Finder", title: "Finder", w: 900, h: 560, chrome: false },
  textedit: { name: "TextEdit", title: "Document", w: 640, h: 560 },
  preview: { name: "Preview", title: "Preview", w: 620, h: 520 },
  browser: { name: "Browser", title: "Browser", w: 860, h: 560, single: true, chrome: false },
  mail: { name: "Mail", title: "New Message", w: 620, h: 520, single: true },
  terminal: { name: "Terminal", title: "Terminal", w: 680, h: 420, single: true },
  settings: { name: "Settings", title: "Settings", w: 700, h: 500, single: true },
  photos: { name: "Photos", title: "Photos", w: 860, h: 560, single: true },
  calendar: { name: "Calendar", title: "Calendar", w: 840, h: 560, single: true },
  activity: { name: "Activity Monitor", title: "Activity Monitor", w: 760, h: 480, single: true },
  info: { name: "Finder", title: "Info", w: 340, h: 400 },
  assistant: { name: "Assistant", title: "Assistant", w: 460, h: 580, single: true },
  resume: { name: "Preview", title: "Resume.pdf", w: 720, h: 640, single: true },
  about: { name: "Portfolio", title: "About This Portfolio", w: 500, h: 320, single: true },
};
