/*
 * Hora Catalana
 * Basada en Text Clock de benica.dev
 * Codi creat amb l'ajuda de ChatGPT
 */
 
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Gdk from 'gi://Gdk';


export default class HoraCatalanaPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'Hora Catalana',
            icon_name: 'preferences-system-time-symbolic',
        });

        const group = new Adw.PreferencesGroup({
            title: 'Configuració bàsica',
            description: 'Opcions per personalitzar el rellotge.',
        });

        // Interruptor per mostrar o amagar la data
        const showDateRow = new Adw.SwitchRow({
            title: 'Mostrar la data',
            subtitle: 'Activa o desactiva la visualització de la data abans de l’hora.',
            active: settings.get_boolean('show-date'),
        });
        
        // Crear una llista de formats disponibles
        const formats = new Gtk.StringList({
            strings: [
                _('Només hora en text'),
                _('Només hora digital'),
                _('Hora digital i en text'),
            ],
        });

        const formatRow = new Adw.ComboRow({
            title: _('Format del rellotge'),
            subtitle: _('Selecciona com vols mostrar l’hora'),
            model: formats,
        });
        
        // Selector de mida de lletra
        const fontRow = new Adw.SpinRow({
            title: _('Mida del text'),
            subtitle: _('Canvia la mida de la lletra del rellotge'),
            adjustment: new Gtk.Adjustment({
                lower: 8,
                upper: 64,
                step_increment: 1,
                page_increment: 2,
                value: settings.get_int('font-size'),
            }),
        });
        
        // Selector de tipus de lletra
        const fonts = new Gtk.StringList({
            strings: ['Sans', 'Serif', 'Monospace', 'Ubuntu', 'Cantarell', 'Noto Sans'],
        });

        const fontFamilyRow = new Adw.ComboRow({
            title: _('Tipus de lletra'),
            subtitle: _('Selecciona la font del rellotge'),
            model: fonts,
        });



        group.add(fontFamilyRow);

        // Sincronitzar amb el valor actual
        const currentFont = settings.get_string('font-family');
        const index = ['Sans', 'Serif', 'Monospace', 'Ubuntu', 'Cantarell', 'Noto Sans'].indexOf(currentFont);
        fontFamilyRow.set_selected(index >= 0 ? index : 0);

        // Guardar el canvi
        fontFamilyRow.connect('notify::selected', (widget) => {
            const value = ['Sans', 'Serif', 'Monospace', 'Ubuntu', 'Cantarell', 'Noto Sans'][widget.selected];
            settings.set_string('font-family', value);
        });





        // Selector de color de text
        const colorDialog = new Gtk.ColorDialog();
        const colorButton = new Gtk.ColorDialogButton({ dialog: colorDialog });

        colorButton.set_rgba(new Gdk.RGBA({
            red: parseInt(settings.get_string('font-color').substring(1, 3), 16) / 255,
            green: parseInt(settings.get_string('font-color').substring(3, 5), 16) / 255,
            blue: parseInt(settings.get_string('font-color').substring(5, 7), 16) / 255,
            alpha: 1,
        }));

        const colorRow = new Adw.ActionRow({
            title: _('Color del text'),
            subtitle: _('Selecciona el color de la lletra del rellotge'),
        });
        colorRow.add_suffix(colorButton);
        colorRow.activatable_widget = colorButton;

        group.add(colorRow);

        // Quan es canvia el color, guardar-lo als settings
        colorButton.connect('notify::rgba', (widget) => {
            const rgba = widget.get_rgba();
            const hex = `#${Math.round(rgba.red * 255).toString(16).padStart(2, '0')}${Math.round(rgba.green * 255).toString(16).padStart(2, '0')}${Math.round(rgba.blue * 255).toString(16).padStart(2, '0')}`;
            settings.set_string('font-color', hex);
        });
        
        


        group.add(fontRow);

        fontRow.connect('notify::value', (widget) => {
            settings.set_int('font-size', widget.get_value());
        });


        // Vincular amb GSettings (0=text, 1=digital, 2=mixed)
        group.add(formatRow);
        formatRow.set_selected({
            'text': 0,
            'digital': 1,
            'mixed': 2,
        }[settings.get_string('clock-format')] ?? 0);

        formatRow.connect('notify::selected', (widget) => {
            const value = ['text', 'digital', 'mixed'][widget.selected];
            settings.set_string('clock-format', value);
        });


        showDateRow.connect('notify::active', (widget) => {
            settings.set_boolean('show-date', widget.active);
        });

        group.add(showDateRow);
        page.add(group);
        window.add(page);
    }
}
