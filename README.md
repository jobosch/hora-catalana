# Hora Catalana — GNOME Shell Extension

(English below)

**Hora Catalana** és una extensió per al GNOME Shell que mostra l’hora en format català tradicional — amb el sistema de quarts — i amb opcions de personalització com el tipus de lletra, mida, color i format (text o digital).

Basada en l'extensió [**Text Clock**](https://extensions.gnome.org/extension/4472/text-clock/) de [benica.dev](https://benica.dev) i feta amb l'ajuda de ChatGPT.

---

## Funcionalitats
- Mostra l’hora en format català natural (amb “quarts”, “mig quart”, “tocades”, etc.).
- Opció de mostrar la data al costat.
- Format **textual**, **digital** o **ambdós**.
- Personalitza:
  - Tipus de lletra
  - Mida de la lletra
  - Color del text
<<<<<<< HEAD

---

## Instal·lació manual
 1. Clona o descarrega aquest repositori:
```bash
   git clone https://github.com/jobosch/hora-catalana.git
```
2. Copia la carpeta a:
```bash
   ~/.local/share/gnome-shell/extensions/hora-catalana@jobosch.github.io/
```
3. Compila els esquemes:
```bash
   glib-compile-schemas schemas/
```

4. Reinicia GNOME Shell (Alt + F2, escriu r, i prem Enter) o tanca sessió si el reinici no està disponible en Wayland.
5. Activa l’extensió amb ```gnome-extensions``` o mitjançant l'aplicaió *Extensions*.



# English Description

**Catalan Time** is a GNOME Shell extension that displays the time in the traditional Catalan format — using the “quarters” bell tower system — and offers customization options such as font type, size, color, and format (text or digital).

Based on the [**Text Clock**](https://extensions.gnome.org/extension/4472/text-clock/) extension by [benica.dev](https://benica.dev) and created with the help of ChatGPT.

---

## Features
- Displays the time in natural Catalan format (with “quarters”, “half quarter”, “struck”, etc.).
- Option to display the date alongside the time.
- **Textual**, **digital**, or **combined** format.
- Customize:
  - Font family
  - Font size
  - Text color

---

## Manual installation
1. Clone or download this repository:
```bash
   git clone https://github.com/jobosch/hora-catalana.git
```
2. Copy the folder to:
```bash
   ~/.local/share/gnome-shell/extensions/hora-catalana@jobosch.github.io/
```
3. Compile the schemas:
```bash
   glib-compile-schemas schemas/
```

4. Restart GNOME Shell (Alt + F2, type r, and press Enter) or log out if restart is not available under Wayland.

5. Enable the extension using ```gnome-extensions``` or via the l'aplicaió *Extensions* application.
