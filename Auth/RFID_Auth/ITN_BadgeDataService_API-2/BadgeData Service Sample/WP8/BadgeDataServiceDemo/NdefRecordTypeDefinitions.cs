﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ITNCommon
{
    /// <summary>
    /// NDEF URI Record Type Definitions (RTD)
    /// </summary>
    class NdefUriRtd
    {
        // Identifier for Uri. e.g. http://
        public string Identifier { get; set; }

        // Uri without the identifier, e.g. nokia.com
        public string Uri { get; set; }

        // Full Uri to be displayed (with identifier)
        public string GetFullUri() { return (Identifier + Uri); }
    }

    /// <summary>
    /// NDEF Text Record Type Definitions (RTD)
    /// </summary>
    class NdefTextRtd
    {
        // Language code in ISO/IANA, e.g. en-US
        public string Language { get; set; }

        // Encoding, UTF-8 or UTF16
        public string Encoding { get; set; }

        // Text to be displayed after decoding
        public string Text { get; set; }
    }
}
