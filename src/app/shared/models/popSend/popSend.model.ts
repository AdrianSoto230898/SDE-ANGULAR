
export interface SendMailConfigResponse {
  docType: string;
  doId: string;
  doNumber: string;

  tipodeEnvio: string;
  tipodeEnvioList: { value: string; text: string }[];

  para: string;
  subject: string;
  body: string;
  datoAdjunto: string;
  from: string;

pnlCombo: boolean;
pnlHome: boolean;
pnlFTP: boolean;
pnlCOPY: boolean;
pnlSFTP: boolean;
pnlWS: boolean;
pnlVar: boolean;

hostFTP: string;
userFTP: string;
pathFTP: string;
filesFTP: string;

rutaDestino: string;
filesCopy: string;

key: string;
pathFrom: string;
pathTo: string;
serverTo: string;

files: {
  fileName: string;
  mimeType: string;
  mimeName: string;
}[];

  

//   files: {
//     fileName: string;
//     mimeType: string;
//     mimeName: string;
//   }[];
}

export interface SendMailResponse {
  error: boolean;
  message: string;
  detail?: string;
  sendType?: string;
  documentType?: string;
  documentNumber?: string;
  processedAt?: string;
}

