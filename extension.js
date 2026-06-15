/*
 * Hora Catalana
 * Basada en Text Clock de benica.dev
 * Codi creat amb l'ajuda de ChatGPT
 */

import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import St from "gi://St";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import { panel } from "resource:///org/gnome/shell/ui/main.js";

let clockLabel = null;
let settings = null;
let timeoutId = null;
let clockNotifyId = 0;
let hiddenClockInfo = {
  type: null, // 'dateMenuClockDisplay' | 'dateMenuClock' | 'panelClock'
  target: null,
};

// Funcions auxiliars
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const hours_art = [
  "les dotze",
  "la una",
  "les dues",
  "les tres",
  "les quatre",
  "les cinc",
  "les sis",
  "les set",
  "les vuit",
  "les nou",
  "les deu",
  "les onze",
];

const hours = [
  "dotze",
  "una",
  "dues",
  "tres",
  "quatre",
  "cinc",
  "sis",
  "set",
  "vuit",
  "nou",
  "deu",
  "onze",
];

const weekdays = [
  "diumenge",
  "dilluns",
  "dimarts",
  "dimecres",
  "dijous",
  "divendres",
  "dissabte",
];

const months = [
  "de gen.",
  "de febr.",
  "de març",
  "d’abr.",
  "de maig",
  "de juny",
  "de jul.",
  "d’ag.",
  "de set.",
  "d’oct.",
  "de nov.",
  "de des.",
];

function getTextClock(hour, minute) {
  const h12 = hour % 12;
  const nextHour = (h12 + 1) % 12;
  const m = minute;

  if (m === 0) return `${capitalize(hours_art[h12])} en punt`;
  if (m === 1) return `${capitalize(hours_art[h12])} i un minut`;
  if (m === 2)
    return `${capitalize(hours_art[h12])} ${h12 === 1 ? "tocada" : "tocades"}`;
  if (m >= 3 && m <= 6) return `${capitalize(hours_art[h12])} i ${m} minuts`;
  if (m === 7 || m === 8)
    return `Mig quart ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m >= 9 && m <= 13)
    return `Falten ${15 - m} minuts per a un quart ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m == 14)
    return `Falta ${15 - m} minut per a un quart ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;

  if (m === 15)
    return `Un quart ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m === 16)
    return `Un quart i ${m - 15} minut ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m >= 17 && m <= 21)
    return `Un quart i ${m - 15} minuts ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m === 22 || m === 23)
    return `Un quart i mig ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m >= 24 && m <= 28)
    return `Falten ${30 - m} minuts per a dos quarts ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m == 29)
    return `Falta ${30 - m} minut per a dos quarts ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;

  if (m === 30)
    return `Dos quarts ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m === 31)
    return `Dos quarts i ${m - 30} minut ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m >= 32 && m <= 36)
    return `Dos quarts i ${m - 30} minuts ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m === 37 || m === 38)
    return `Dos quarts i mig ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m >= 39 && m <= 43)
    return `Falten ${45 - m} minuts per a tres quarts ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m == 44)
    return `Falta ${45 - m} minut per a tres quarts ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;

  if (m === 45)
    return `Tres quarts ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m === 46)
    return `Tres quarts i ${m - 45} minut ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m >= 47 && m <= 51)
    return `Tres quarts i ${m - 45} minuts ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m === 52 || m === 53)
    return `Tres quarts i mig ${nextHour === 1 || nextHour === 11 ? "d'" : "de "}${hours[nextHour]}`;
  if (m >= 54 && m <= 58)
    return `Falten ${60 - m} minuts per a ${hours_art[nextHour]}`;
  if (m == 59) return `Falta ${60 - m} minut per a ${hours_art[nextHour]}`;
  return `${hours_art[h12]} ${m} minuts`;
}

function getDateText(date) {
  const dayName = weekdays[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  return `${capitalize(dayName)} ${dayNum} ${monthName}`;
}

/* updateClock — Escriu el text al nostre label (Data | Hora) */
function updateClock() {
  if (!clockLabel) return GLib.SOURCE_CONTINUE;

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  const textTime = getTextClock(hour, minute);
  const dateText = getDateText(now);
  const showDate = settings ? settings.get_boolean("show-date") : true;
  const format = settings ? settings.get_string("clock-format") : "text";
  const separator = settings ? ` ${settings.get_string("separator")} ` : " | ";

  const digitalTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

  let display = "";

  if (format === "text") {
    display = showDate ? `${dateText}${separator}${textTime}` : textTime;
  } else if (format === "digital") {
    display = showDate ? `${dateText}${separator}${digitalTime}` : digitalTime;
  } else if (format === "mixed") {
    display = showDate
      ? `${dateText}${separator}${digitalTime}${separator}${textTime}`
      : `${digitalTime}${separator}${textTime}`;
  }

  clockLabel.set_text(display);

  const fontSize = settings ? settings.get_int("font-size") : 14;
  const fontFamily = settings ? settings.get_string("font-family") : "Sans";
  const fontColor = settings ? settings.get_string("font-color") : "#FFFFFF";

  try {
    clockLabel.set_style(
      `font-size: ${fontSize}px; font-family: "${fontFamily}"; color: ${fontColor};`,
    );
  } catch (e) {
    logError(e, "hora-catalana: error aplicant estil al rellotge");
  }

  return GLib.SOURCE_CONTINUE;
}

/* scheduleNextUpdate — sincronitza actualització al començament del minut (fallback per a versions antigues de GNOME) */
function scheduleNextUpdate() {
  if (timeoutId) {
    GLib.source_remove(timeoutId);
    timeoutId = null;
  }

  // Calcula els mil·lisegons exactes fins al proper inici de minut
  const now = new Date();
  const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  timeoutId = GLib.timeout_add(
    GLib.PRIORITY_DEFAULT,
    Math.max(msToNextMinute, 100),
    () => {
      updateClock();
      // Reprograma des de l'hora real — sense deriva acumulada
      scheduleNextUpdate();
      return GLib.SOURCE_REMOVE;
    },
  );
}

/* hideDefaultClock — amaga el rellotge per defecte del shell */
function hideDefaultClock() {
  try {
    if (panel.statusArea && panel.statusArea.dateMenu) {
      const dateMenu = panel.statusArea.dateMenu;

      // GNOME 46+: _clockDisplay és un St.Label dins un St.BoxLayout
      if (dateMenu._clockDisplay) {
        hiddenClockInfo.type = "dateMenuClockDisplay";
        hiddenClockInfo.target = dateMenu._clockDisplay;
        dateMenu._clockDisplay.hide();
        return;
      }

      // GNOME < 46: _clock és l'actor del rellotge
      if (dateMenu._clock) {
        hiddenClockInfo.type = "dateMenuClock";
        hiddenClockInfo.target = dateMenu._clock;
        dateMenu._clock.hide();
        return;
      }
    }

    // Versions molt antigues
    if (panel._clock) {
      hiddenClockInfo.type = "panelClock";
      hiddenClockInfo.target = panel._clock;
      panel._clock.hide();
      return;
    }
  } catch (e) {
    logError(e, "hora-catalana: error intentant amagar rellotge per defecte");
  }
}

/* restoreDefaultClock — restaurar el rellotge que hem amagat */
function restoreDefaultClock() {
  try {
    if (!hiddenClockInfo.type || !hiddenClockInfo.target) return;

    if (hiddenClockInfo.type === "dateMenuClockDisplay") {
      hiddenClockInfo.target.show();
    } else if (hiddenClockInfo.type === "dateMenuClock") {
      hiddenClockInfo.target.show();
    } else if (hiddenClockInfo.type === "panelClock") {
      hiddenClockInfo.target.show();
    }
  } catch (e) {
    logError(e, "hora-catalana: error restaurar rellotge per defecte");
  } finally {
    hiddenClockInfo = { type: null, target: null };
  }
}

// Extensió principal
export default class TextClockExtension extends Extension {
  enable() {
    settings = this.getSettings();

    // Amaguem el rellotge original
    hideDefaultClock();

    // Creem el nostre label personalitzat
    clockLabel = new St.Label({
      text: "",
      y_expand: true,
    });
    clockLabel.clutter_text.y_align = Clutter.ActorAlign.CENTER;

    // Inserim el label al mateix lloc que ocupava el rellotge original
    try {
      const dateMenu = panel.statusArea.dateMenu;
      if (dateMenu && dateMenu._clockDisplay) {
        const parent = dateMenu._clockDisplay.get_parent();
        const children = parent.get_children();
        const pos = children.indexOf(dateMenu._clockDisplay);
        parent.insert_child_at_index(clockLabel, pos >= 0 ? pos : 0);
      }
    } catch (e) {
      logError(e, "hora-catalana: error inserint el rellotge dins el dateMenu");
    }

    // Actualització inicial
    updateClock();

    // Escoltem el notify::text del rellotge original (actualitzat pel WallClock cada minut) sense necessitat de timeouts
    const dateMenu = panel.statusArea.dateMenu;
    if (dateMenu && dateMenu._clockDisplay) {
      clockNotifyId = dateMenu._clockDisplay.connect(
        "notify::text",
        updateClock,
      );
    } else {
      // Fallback per versions antigues
      scheduleNextUpdate();
    }

    // Quan canviï la configuració, actualitzem el rellotge
    if (settings) {
      settings.connect("changed::show-date", updateClock);
      settings.connect("changed::clock-format", updateClock);
      settings.connect("changed::font-size", updateClock);
      settings.connect("changed::font-family", updateClock);
      settings.connect("changed::font-color", updateClock);
      settings.connect("changed::separator", updateClock);
    }
  }

  disable() {
    // Desconnectar senyal del rellotge original
    if (clockNotifyId) {
      const dateMenu = panel.statusArea?.dateMenu;
      if (dateMenu?._clockDisplay) {
        dateMenu._clockDisplay.disconnect(clockNotifyId);
      }
      clockNotifyId = 0;
    }

    // Aturar timeouts (fallback)
    if (timeoutId) {
      GLib.source_remove(timeoutId);
      timeoutId = null;
    }

    // Treure el nostre label
    if (clockLabel) {
      try {
        if (clockLabel.get_parent()) {
          clockLabel.get_parent().remove_child(clockLabel);
        }
        clockLabel.destroy();
      } catch (e) {
        logError(e, "hora-catalana: error destruint el rellotge personalitzat");
      }
      clockLabel = null;
    }

    // Restaurar rellotge per defecte
    restoreDefaultClock();
    settings = null;
  }
}
