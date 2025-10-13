/*
 * Hora Catalana
 * Basada en Text Clock de benica.dev
 * Codi creat amb l'ajuda de ChatGPT
 */
 
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import { panel } from 'resource:///org/gnome/shell/ui/main.js';
import { Extension, gettext as _, } from 'resource:///org/gnome/shell/extensions/extension.js';

let clockLabel = null;
let settings = null;
let timeoutId = null;
let hiddenClockInfo = {
    type: null, // 'dateMenuClockDisplay' | 'dateMenuClock' | 'panelClock'
    target: null,
    originalWidth: null,
};

// Funcions auxiliars
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const hours_art = [
    'les dotze', 'la una', 'les dues', 'les tres', 'les quatre',
    'les cinc', 'les sis', 'les set', 'les vuit', 'les nou', 'les deu', 'les onze'
];

const hours = [
    'dotze', 'una', 'dues', 'tres', 'quatre',
    'cinc', 'sis', 'set', 'vuit', 'nou', 'deu', 'onze'
];

const weekdays = ['diumenge','dilluns','dimarts','dimecres','dijous','divendres','dissabte'];

const months = [
    'de gen.', 'de febr.', 'de març', 'd’abr.', 'de maig', 'de juny',
    'de jul.', 'd’ag.', 'de set.', 'd’oct.', 'de nov.', 'de des.'
];

function getTextClock(hour, minute) {
    const h12 = hour % 12;
    const nextHour = (h12 + 1) % 12;
    const m = minute;

    if (m === 0) return `${capitalize(hours_art[h12])} en punt`;
    if (m === 1) return `${capitalize(hours_art[h12])} i un minut`;
    if (m === 2) return `${capitalize(hours_art[h12])} ${h12 === 1 ? 'tocada' : 'tocades'}`;
    if (m >= 3 && m <= 6) return `${capitalize(hours_art[h12])} i ${m} minuts`;
    if (m === 7 || m === 8) return `Mig quart ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m >= 9 && m <= 13) return `Falten ${15 - m} minuts per a un quart ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m == 14) return `Falta ${15-m} minut per a un quart ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;

    if (m === 15) return `Un quart ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m === 16) return `Un quart i ${m-15} minut ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m >= 17 && m <= 21) return `Un quart i ${m-15} minuts ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m === 22 || m === 23) return `Un quart i mig ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m >= 24 && m <= 28) return `Falten ${30 - m} minuts per a dos quarts ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m == 29) return `Falta ${30-m} minut per a dos quarts ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;

    if (m === 30) return `Dos quarts ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m === 31) return `Dos quarts i ${m-30} minut ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m >= 32 && m <= 36) return `Dos quarts i ${m-30} minuts ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m === 37 || m === 38) return `Dos quarts i mig ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m >= 39 && m <= 43) return `Falten ${45 - m} minuts per a tres quarts ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m == 44) return `Falta ${45-m} minut per a tres quarts ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;

    if (m === 45) return `Tres quarts ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m === 46) return `Tres quarts i ${m-45} minut ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m >= 47 && m <= 51) return `Tres quarts i ${m-45} minuts ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m === 52 || m === 53) return `Tres quarts i mig ${nextHour === 1 || nextHour === 11 ? "d'" : 'de '}${hours[nextHour]}`;
    if (m >= 54 && m <= 58) return `Falten ${60 - m} minuts per a ${hours_art[nextHour]}`;
    if (m == 59) return `Falta ${60-m} minut per a ${hours_art[nextHour]}`;
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
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const textTime = getTextClock(hour, minute);
    const dateText = getDateText(now);
    const showDate = settings ? settings.get_boolean('show-date') : true;
    const format = settings ? settings.get_string('clock-format') : 'text';

    // Calcular hora digital
    const digitalTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    let display = '';

    if (format === 'text') {
        display = showDate ? `${dateText} | ${textTime}` : textTime;
    } else if (format === 'digital') {
        display = showDate ? `${dateText} | ${digitalTime}` : digitalTime;
    } else if (format === 'mixed') {
        display = showDate ? `${dateText} | ${digitalTime} | ${textTime}` : `${digitalTime} | ${textTime}`;
    }

    // Triar l'actor on escriurem i aplicarem l'estil. Compatible amb St.Label o St.Button(child Label)
    let targetLabel = null;
    if (!clockLabel) return GLib.SOURCE_CONTINUE;
    if (clockLabel.child && clockLabel.child.set_text) {
        targetLabel = clockLabel.child;
    } else if (typeof clockLabel.set_text === 'function') {
        targetLabel = clockLabel;
    }

    if (targetLabel) {
        targetLabel.set_text(display);

        // Aplicar estil des dels settings (si existeixen)
        const fontSize = settings ? settings.get_int('font-size') : 14;
        const fontFamily = settings ? settings.get_string('font-family') : 'Sans';
        const fontColor = settings ? settings.get_string('font-color') : '#FFFFFF';

        // Construïm l'style CSS inline. Pots afegir altres propietats si fa falta.
        const styleStr = `font-size: ${fontSize}px; font-family: "${fontFamily}"; color: ${fontColor};`;
        try {
            targetLabel.set_style(styleStr);
        } catch (e) {
            // Si algo falla, no ho fem crític; loguem l'error per debug
            logError(e, 'hora-catalana: error aplicant estil al rellotge');
        }
    }

    return GLib.SOURCE_CONTINUE;
}




/* scheduleNextUpdate — sincronitza actualització al començament del minut */
function scheduleNextUpdate() {
    // Allibera qualsevol timeout anterior (seguretat)
    if (timeoutId) {
        try { GLib.Source.remove(timeoutId); } catch (e) { /* ignore */ }
        timeoutId = null;
    }

    const now = new Date();
    const secondsToNextMinute = 60 - now.getSeconds();

    // Primer timeout: esperar fins al següent inici de minut
    timeoutId = GLib.timeout_add_seconds(
        GLib.PRIORITY_DEFAULT,
        secondsToNextMinute,
        () => {
            updateClock();
            // A partir d'aquí, cada 60 segons de forma recurrent
            timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, updateClock);
            return GLib.SOURCE_REMOVE; // eliminar aquest primer timeout
        }
    );
}

/* hideDefaultClock — intenta amagar el rellotge per defecte del shell */
function hideDefaultClock() {
    try {
        if (panel.statusArea && panel.statusArea.dateMenu) {
            const dm = panel.statusArea.dateMenu;
            // Si existeix el _clockDisplay (objecte St.BoxLayout en versions noves)
            if (dm._clockDisplay) {
                hiddenClockInfo.type = 'dateMenuClockDisplay';
                hiddenClockInfo.target = dm._clockDisplay;
                // Guardar width original per restaurar després
                try { hiddenClockInfo.originalWidth = dm._clockDisplay.get_width(); } catch (e) { hiddenClockInfo.originalWidth = -1; }
                try { dm._clockDisplay.remove_style_class_name('clock'); } catch (e) {}
                try { dm._clockDisplay.set_width(0); } catch (e) {}
                try { dm._clockDisplay.hide(); } catch (e) {}
                return;
            }
            // Si existeix directament _clock
            if (dm._clock) {
                hiddenClockInfo.type = 'dateMenuClock';
                hiddenClockInfo.target = dm._clock;
                try { dm._clock.hide(); } catch (e) {}
                return;
            }
        }

        // Caiguda: provar panel._clock (algunes facetes)
        if (panel._clock) {
            hiddenClockInfo.type = 'panelClock';
            hiddenClockInfo.target = panel._clock;
            try { panel._clock.hide(); } catch (e) {}
            return;
        }
    } catch (e) {
        logError(e, 'hora-catalana: error intentant amagar rellotge per defecte');
    }
}

/* restoreDefaultClock — restaurar el rellotge que hem amagat */
function restoreDefaultClock() {
    try {
        if (!hiddenClockInfo.type || !hiddenClockInfo.target) return;

        if (hiddenClockInfo.type === 'dateMenuClockDisplay') {
            try { hiddenClockInfo.target.show(); } catch (e) {}
            try {
                if (hiddenClockInfo.originalWidth && hiddenClockInfo.originalWidth > 0)
                    hiddenClockInfo.target.set_width(hiddenClockInfo.originalWidth);
                else
                    hiddenClockInfo.target.set_width(-1);
            } catch (e) {}
            try { hiddenClockInfo.target.add_style_class_name('clock'); } catch (e) {}
        } else if (hiddenClockInfo.type === 'dateMenuClock') {
            try { hiddenClockInfo.target.show(); } catch (e) {}
        } else if (hiddenClockInfo.type === 'panelClock') {
            try { hiddenClockInfo.target.show(); } catch (e) {}
        }
    } catch (e) {
        logError(e, 'hora-catalana: error restaurar rellotge per defecte');
    } finally {
        hiddenClockInfo = { type: null, target: null, originalWidth: null };
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
        text: '',
        y_align: Clutter.ActorAlign.CENTER,
    });

    // Fem que es comporti com el rellotge original del dateMenu
    try {
        const dm = panel.statusArea.dateMenu;
        if (dm) {
            // El contenidor original del rellotge
            const clockDisplayBox = dm._clockDisplay || dm._clock || null;

            // Si existeix, hi col·loquem el nostre
            if (clockDisplayBox) {
                const box = new St.BoxLayout({ style_class: 'clock-display-box' });
                box.add_child(clockLabel);
                dm.actor.insert_child_at_index(box, 0);
                clockLabel.add_style_class_name('clock'); // mateixa classe d’estil
            }

            // Connectar el clic per obrir el calendari (mateix comportament)
            clockLabel.connect('button-press-event', () => {
                try {
                    dm.menu.toggle();
                } catch (e) {
                    logError(e, 'hora-catalana: error obrint calendari');
                }
            });
        }
    } catch (e) {
        logError(e, 'hora-catalana: error inserint el rellotge dins el dateMenu');
    }

    // Actualització inicial i programada
    updateClock();
    scheduleNextUpdate();

    // Quan canviï la configuració, actualitzem el rellotge
    if (settings) {
        settings.connect('changed::show-date', updateClock);
        settings.connect('changed::clock-format', updateClock);
        settings.connect('changed::font-size', updateClock);
        settings.connect('changed::font-family', updateClock);
        settings.connect('changed::font-color', updateClock);
    }

}


    disable() {
        // Aturar timeouts
        if (timeoutId) {
            try { GLib.Source.remove(timeoutId); } catch (e) {}
            timeoutId = null;
        }

        // Treure el nostre label
        if (clockLabel) {
            try {
                if (panel._centerBox && panel._centerBox.contains(clockLabel))
                    panel._centerBox.remove_child(clockLabel);
                else
                    panel.remove_child(clockLabel);
            } catch (e) {
                try { clockLabel.destroy(); } catch (e) {}
            }
            clockLabel = null;
        }

        // Restaurar rellotge per defecte
        restoreDefaultClock();
        
        settings = null;
    }
}
