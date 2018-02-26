using System;

namespace BadgeDataService {
    public class BadgeRequest {
        public string AuthKey { get; set; }
        public string ActivationCode { get; set; }
        public string DeviceIdentifier { get; set; }
        public string NdefRecord { get; set; }
        public string QrCode { get; set; }
    }
}
