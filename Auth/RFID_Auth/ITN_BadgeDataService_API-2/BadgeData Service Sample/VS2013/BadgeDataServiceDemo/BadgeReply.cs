using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace BadgeDataService {
    public class BadgeReply {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public BcardData BadgeData { get; set; }
    }
}
