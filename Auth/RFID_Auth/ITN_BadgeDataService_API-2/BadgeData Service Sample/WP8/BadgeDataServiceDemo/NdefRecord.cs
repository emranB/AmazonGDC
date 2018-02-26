using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ITNCommon
{
    class NdefRecord
    {
        public bool Mb { get; set; }
        public bool Me { get; set; }
        public bool Cf { get; set; }
        public bool Sr { get; set; }
        public bool Il { get; set; }
        public byte Tnf { get; set; }

        public UInt16 TypeLength { get; set; }
        public UInt16 IdLength { get; set; }
        public UInt32 PayloadLength { get; set; }
        public byte[] Type { get; set; }
        public byte[] Id { get; set; }
        public byte[] Payload { get; set; }

        // Is Smart Poster record
        public bool IsSpRecord { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public NdefRecord()
        {
            Type = null;
            Id = null;
            Payload = null;
        }
    }
}
