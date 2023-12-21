
interface MultiTenancy {
    isEnabled: boolean;
    ignoreFeatureCheckForHostUsers: boolean;
    sides: {
      host: number;
      tenant: number;
    };
  };
  
  interface CurrentLanguage {
    name: string;
    displayName: string;
    icon: string;
    isDefault: boolean;
    isDisabled: boolean;
    isRightToLeft: boolean;
  }
  
  interface Language {
    name: string;
    displayName: string;
    icon: string;
    isDefault: boolean;
    isDisabled: boolean;
    isRightToLeft: boolean;
  }
  
  interface LocalizationSource {
    name: string;
    type: string;
  }
  
  interface Values {
    [key: string]: any;
  }
  
  interface Localization {
    currentCulture: CurrentLanguage;
    languages: Language[];
    currentLanguage: CurrentLanguage;
    sources: LocalizationSource[];
    values: Values;
  }
  
  interface AllFeatures {
    [key: string]: any;
  }
  
  interface AuthPermissions {
    [key: string]: string;
  }
  
  interface NavMenu {
    name: string;
    displayName: string;
    customData: any;
    items: any[];
  }
  
  interface Nav {
    menus: {
      MainMenu: NavMenu;
    };
  }
  
  interface SettingValues {
    [key: string]: string;
  }
  
  interface Setting {
    values: SettingValues;
  }
  
  interface TimeZoneInfo {
    windows: {
      timeZoneId: string;
      baseUtcOffsetInMilliseconds: number;
      currentUtcOffsetInMilliseconds: number;
      isDaylightSavingTimeNow: boolean;
    };
    iana: {
      timeZoneId: string;
    };
  }
  
  interface Timing {
    timeZoneInfo: TimeZoneInfo;
  }
  
  interface AntiForgery {
    tokenCookieName: string;
    tokenHeaderName: string;
  }
  
  interface Security {
    antiForgery: AntiForgery;
  }
  
  export interface GetAllResponse {
    result: {
      multiTenancy: MultiTenancy;
      session: {
        userId: number;
        tenantId: number;
        impersonatorUserId: number | null;
        impersonatorTenantId: number | null;
        multiTenancySide: number;
      };
      localization: Localization;
      features: {
        allFeatures: AllFeatures;
      };
      auth: {
        allPermissions: AuthPermissions;
        grantedPermissions: AuthPermissions;
      };
      nav: Nav;
      setting: Setting;
      clock: {
        provider: string;
      };
      timing: Timing;
      security: Security;
      custom: any;
    };
    targetUrl: string | null;
    success: boolean;
    error: any;
    unAuthorizedRequest: boolean;
    __abp: boolean;
  }
  