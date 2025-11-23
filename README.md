# Simulación de un Sistema ANC (Active Noise Cancellation) - TDC
Simulación de un sistema de lazo cerrado para un auricular ANC ("Active Noise Cancellation", Cancelación Activa de Ruido).
La implementación está realizada completamente en **HTML + CSS + JavaScript**, y se ejecuta directamente en el navegador sin dependencias externas.

## Demo en vivo (GitHub Pages)

<a href="https://ariel-sng.github.io/auricularANC/root/" target="_blank"> **Abrir simulación ANC** </a>

La aplicación es 100% web y no requiere instalación.

---

Cada panel soporta:
- Autoescalado
- Bandas de error visuales
- Colores diferenciados por serie
- Ventana móvil para simulación en tiempo real

## Estructura del Proyecto
root/

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── index.html     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  # Interfaz principal y estructura de la simulación

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── styles.css     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  # Estilos visuales del panel y los controles

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── app.js      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   # Lógica del sistema ANC (control adaptativo, señales y gráficos)

## Cómo ejecutar localmente

1. Descargá o cloná el repositorio con el siguiente comando.
   
   ```bash
   git clone https://github.com/ariel-sng/auricularANC
   
3. Abrí el archivo **/root/index.html** en cualquier navegador moderno.
4. ¡Simulador abierto! No requiere servidor ni instalación de librerías externas.





