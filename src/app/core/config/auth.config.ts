// auth.config.ts
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { MsalInterceptorConfiguration, MsalGuardConfiguration } from '@azure/msal-angular';
import { environment } from '../../../environments/environment.development';

export const msalInstance = new PublicClientApplication({
    auth: {
        clientId: environment.AZURE_CONFIG.clientId,
        authority: `https://login.microsoftonline.com/${environment.AZURE_CONFIG.tenantId}`,
        redirectUri: environment.AZURE_CONFIG.redirectUri,
        postLogoutRedirectUri: environment.AZURE_CONFIG.postLogoutRedirectUri
    }
});

export const msalInterceptorConfig: MsalInterceptorConfiguration = {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map<string, string[]>([
        // ['https://api.protegida.com/', ['api://<client-id>/user_impersonation']]
    ])
};

export const msalGuardConfig: MsalGuardConfiguration = {
    interactionType: InteractionType.Redirect,
    authRequest: {
        scopes: ['User.Read']
    }
};
