using System;

namespace BadgeDataService {
    public class BadgeReply {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public BcardData BadgeData { get; set; }
    }
}
