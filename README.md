# Calculadora de Tarifas de Taxi BA

Una aplicación web para estimar el costo de viajes en taxi en Buenos Aires, Argentina.

## Funcionalidades

- Selección de punto de partida y destino en un mapa interactivo.
- Búsqueda de direcciones para los puntos de partida y destino.
- Selección de fecha y hora del viaje para aplicar tarifas diurnas o nocturnas.
- Cálculo de la tarifa estimada basada en la distancia y las tarifas vigentes.
- Visualización de detalles de la tarifa aplicada.

## Tecnologías Utilizadas

- **React**: Biblioteca principal para la construcción de la interfaz de usuario.
- **TypeScript**: Para añadir tipado estático al código JavaScript.
- **Vite**: Herramienta de frontend para un desarrollo y build rápidos.
- **OpenLayers**:
    - Utilizado para renderizar el mapa interactivo.
    - Permite la selección de puntos de origen y destino directamente en el mapa.
    - Dibuja la ruta (línea recta) entre los puntos seleccionados.
    - Calcula la distancia directa entre los puntos.
- **Tailwind CSS**: Framework de CSS de utilidad para estilizar la aplicación.
- **Firebase**: (Opcional) Utilizado para la gestión y carga dinámica de las configuraciones de tarifas.

## Ejecutar Localmente

**Requisitos Previos:** Node.js y npm (o yarn).

1.  **Clonar el repositorio (si aplica):**
    ```bash
    git clone https://github.com/smithplus/Baxi.git
    cd Baxi
    ```

2.  **Instalar dependencias:**
    Navega a la raíz del proyecto y ejecuta:
    ```bash
    npm install
    ```

3.  **Ejecutar la aplicación en modo desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en la URL local que Vite muestre en la consola (ej. `http://localhost:5173`).

## Build para Producción

Para crear una versión optimizada para producción, ejecuta:

```bash
npm run build
```
Esto generará los archivos estáticos en el directorio `dist`.

## Sobre el Desarrollo

Este proyecto fue desarrollado como una herramienta práctica para calcular tarifas de taxi. Se enfocó en una interfaz de usuario clara y en la integración de un mapa interactivo para una fácil selección de ubicaciones. La lógica de cálculo de tarifas considera tanto la distancia como los posibles cambios tarifarios por horario (diurno/nocturno).

## Despliegue

Puedes desplegar los archivos generados en la carpeta `dist` en cualquier servicio de hosting de sitios estáticos (por ejemplo, Vercel, Netlify, GitHub Pages, Firebase Hosting, etc.).
