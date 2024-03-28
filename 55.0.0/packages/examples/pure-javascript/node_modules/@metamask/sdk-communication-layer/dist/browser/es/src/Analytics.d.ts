import { CommunicationLayerPreference } from './types/CommunicationLayerPreference';
import { OriginatorInfo } from './types/OriginatorInfo';
import { TrackingEvents } from './types/TrackingEvent';
export interface AnalyticsProps {
    id: string;
    event: TrackingEvents;
    originationInfo?: OriginatorInfo;
    commLayer?: CommunicationLayerPreference;
    sdkVersion?: string;
    commLayerVersion?: string;
    walletVersion?: string;
    params?: Record<string, unknown>;
}
export declare const SendAnalytics: (parameters: AnalyticsProps, socketServerUrl: string) => Promise<void>;
//# sourceMappingURL=Analytics.d.ts.map