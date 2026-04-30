# Template Comercial App

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.2.

## Install dependences
Run `npm install`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build Development

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Build App Production
Run `ng build -c production`

### Build App development MDW
Run `ng build --base-href "/Traductor_Productos/" -c development`

### Build App qa MDW
Run `ng build --base-href "/Traductor_Productos/" -c qa`

### Build App production MDW
Run `ng build --base-href "/Traductor_Productos/" -c production`

## New Build App WEB01
### Build App qa
Run `ng build -c qa`

### Build App production
Run `ng build -c production`

## URL Dev Ternium
### Base
`http://termxsvcweb01:8091/api/Extraccion/estados`

### Mask
`http://traductor-producto-api-dev.ternium.net/`


## Update next version

### 1. Update Angular CLI
ng update @angular/cli@19 @angular/core@19

### 2. Install Tailwind CSS, PostCSS, and daisyUI
npm install daisyui@latest tailwindcss@latest @tailwindcss/postcss@latest postcss@latest --force

### 3. Add Tailwind CSS plugin for PostCSS to a new.postcssrc.jsonfile at root

.postcssrc.json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}

### 4. Install Iconify Icons
npm i -D @iconify/tailwind4 --legacy-peer-deps

## 5. Include to style.css file the following configuration
/* You can add global styles to this file, and also import other style files */

/* Import custom scss */
@import 'assets/theme/custom.scss';

@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
@theme {
    --color-ternium: #ff3300;
    --color-ternium-hover: #ff4f23;
}

@plugin "daisyui";

/* Configuración de tu tema Ternium con DaisyUI */
@plugin "daisyui/theme" {
    name: "ternium";
    default: true;
    prefersdark: false;
    color-scheme: light;

    --color-primary: #ff3300;
    --color-primary-content: #ffffff;
    --color-primary-tint: #ff4f23;
  }

@plugin "@iconify/tailwind4";

## 6 . Add theme to index.html
<html data-theme="ternium">

## Publicar ambiente prod API

1. Cambiar las variables de entorno a production
Ambiente.PRODMX
Ambiente.QAMX

2. Revisar la clase ConvertirCadenaACookies en SolicitudGovService, usar el dominio correspondiente
QA
Domain = "ncaqamxl.ternium.techint.net",

PROD
Domain = "ncaprodmxl.ternium.techint.net",


Revisar NCAUtils.cs para ajustar el usuario
Linea 52
-- QA
//private static string USER = "TermxSdeSvcUser";
//private static string PWD = "Ter20mxSde17SvcUser";

-- Prod
private static string USER = "TERMXSDEScvuser";
private static string PWD = "X6izB11n";


Linea 207
 string url = GetUrlAmbiente("PRODMX");


wiki-comercial-site (prod)
Application (client) ID = > 761b8375-ad7c-4bbc-b783-6166a6be55e4
Directory (tenant) ID => ba4b5b72-704f-43e8-88a7-720311750a10