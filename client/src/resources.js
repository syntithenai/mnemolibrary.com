let Resources={};
Resources.keywordIDs = {
        'ok lamp': new Uint8Array([
            0xac, 0x24, 0x75, 0x21, 0x14, 0x3d, 0x2a, 0xe7, 0x0a, 0x85, 0x75, 0x4c,
            0x48, 0x31, 0x5b, 0x44, 0x4b, 0xb6, 0xe8, 0xc3, 0x77, 0x30, 0xd5, 0xac,
            0xca, 0x54, 0x06, 0x29, 0xbd, 0x15, 0xca, 0x90, 0x55, 0x81, 0xae, 0x21,
            0x6a, 0x04, 0x1e, 0x5a, 0x9d, 0x64, 0x83, 0x0c, 0x04, 0x03, 0x6b, 0xe8,
            0x22, 0x2e, 0x19, 0xbf, 0x7e, 0x2b, 0x4d, 0x8c, 0x50, 0x27, 0xb6, 0x11,
            0xf3, 0x17, 0xc3, 0xf9, 0xe3, 0x69, 0x19, 0x26, 0xbe, 0x0d, 0xad, 0x78,
            0x74, 0x61, 0x4b, 0xb8, 0xde, 0x83, 0x1c, 0xb9, 0xa1, 0x06, 0x27, 0x77,
            0x03, 0xb2, 0x24, 0x82]),
         'navy blue': new Uint8Array([
            0xd9, 0x36, 0xb2, 0xcc, 0x5d, 0xbb, 0x2b, 0x66, 0xae, 0xbb, 0x39, 0xf3,
            0x24, 0xf4, 0x02, 0xf2, 0xb9, 0x5a, 0xf7, 0xd7, 0x8d, 0x02, 0xbc, 0x7b,
            0xa3, 0x04, 0xb3, 0xfd, 0x2c, 0x0b, 0x9c, 0x10, 0x2c, 0x28, 0x6f, 0x65,
            0x3f, 0xb9, 0x39, 0x08, 0x44, 0x62, 0x47, 0x3a, 0xd8, 0x6d, 0xe7, 0x4a,
            0xd9, 0x64, 0x50, 0x6b, 0xd0, 0x39, 0x7e, 0x43, 0x05, 0xeb, 0xf8, 0xc2,
            0xe7, 0xab, 0xf5, 0x39, 0x88, 0xd4, 0x99, 0x3c, 0x2d, 0x2a, 0xf2, 0xeb,
            0x69, 0x5b, 0x34, 0x7b, 0x51, 0x61, 0x83, 0x82, 0x08, 0x76, 0xdf, 0x86,
            0xab, 0xe8, 0x83, 0x48]),
       //'yellow': new Uint8Array([
            //0x6f, 0x7d, 0x2c, 0x10, 0xcb, 0xf0, 0x76, 0x1b, 0xee, 0xeb, 0x80, 0xaa,
            //0xe1, 0xa5, 0xfa, 0x53, 0xe3, 0xce, 0x4b, 0x59, 0x7d, 0xeb, 0xe3, 0x11,
            //0x13, 0x87, 0x61, 0xa5, 0xef, 0x04, 0x04, 0x37, 0x63, 0xf6, 0x63, 0x91,
            //0x44, 0x22, 0xf2, 0x50, 0xab, 0xb7, 0x35, 0x8c, 0xcf, 0x33, 0xf7, 0xc1,
            //0xf1, 0x06, 0x6c, 0x37, 0x6b, 0x2d, 0x50, 0x0e, 0x1c, 0x1c, 0xee, 0x9d,
            //0x3d, 0x56, 0xa6, 0x54, 0x51, 0xb2, 0xf4, 0x3d, 0x76, 0x7b, 0xcf, 0x4c]),
        //'orange': new Uint8Array([
            //0xb6, 0x3e, 0x3e, 0xbf, 0x78, 0x5f, 0x1c, 0xc4, 0xf2, 0xdb, 0x0e, 0xca,
            //0xd6, 0xb2, 0xad, 0x34, 0x35, 0xe7, 0x90, 0xfb, 0xde, 0x7f, 0x8e, 0x99,
            //0xab, 0xd1, 0x6b, 0x55, 0x71, 0x94, 0x5c, 0x12, 0xd4, 0x81, 0x1d, 0xd4,
            //0x71, 0xb2, 0x2b, 0x11, 0x1d, 0xe6, 0x52, 0xdb, 0x30, 0x44, 0x0c, 0xf9,
            //0xb0, 0xc2, 0x97, 0x3a, 0xe5, 0x78, 0x72, 0xd2, 0x24, 0xd3, 0xde, 0x4e,
            //0xb0, 0xd5, 0xb9, 0xdf, 0x77, 0xd4, 0x2f, 0x2b, 0x80, 0x1a, 0xe5, 0x5c,
            //0x8c, 0x9e, 0xc5, 0xb3]),
        //'purple': new Uint8Array([
            //0xae, 0xce, 0x95, 0x72, 0x5d, 0x85, 0x46, 0x3b, 0x45, 0x50, 0x72, 0xb3,
            //0xd1, 0x80, 0xfa, 0x1c, 0x17, 0x4f, 0x6c, 0x2a, 0x76, 0x5e, 0x0e, 0xb0,
            //0x2d, 0x1b, 0x62, 0x8d, 0xa3, 0xf5, 0x64, 0xff, 0xc7, 0xf6, 0xf2, 0xe3,
            //0xc5, 0x34, 0xef, 0x78, 0x1e, 0xb1, 0xeb, 0x0c, 0xaa, 0x29, 0x5b, 0xb3,
            //0xa8, 0x25, 0x14, 0xd4, 0x80, 0xbf, 0x93, 0x89, 0xe1, 0x7c, 0x5e, 0xd8,
            //0x08, 0x3a, 0xbf, 0x9f, 0x7f, 0xe7, 0x79, 0x13, 0xed, 0xbc, 0xa3, 0x0b,
            //0xf4, 0xd2, 0xfc, 0xf2]),
        //'white': new Uint8Array([
            //0x5e, 0x52, 0xf1, 0xab, 0x90, 0xae, 0x36, 0x5f, 0x98, 0xd2, 0x96, 0xba,
            //0xd8, 0x13, 0x16, 0xf1, 0x66, 0x73, 0xa5, 0xbb, 0x95, 0x0d, 0xfa, 0x9e,
            //0x47, 0x05, 0xc7, 0x3d, 0x36, 0xaf, 0x97, 0x14, 0x98, 0xbc, 0x15, 0xfb,
            //0xa0, 0xdc, 0xb1, 0x60, 0xa2, 0x60, 0x1d, 0x0a, 0x66, 0x5f, 0x47, 0xb8,
            //0xfd, 0x71, 0x3b, 0xe3, 0x06, 0x8d, 0xf4, 0xbd, 0xc6, 0x02, 0xbe, 0x47,
            //0xde, 0x7f, 0xa4, 0x12, 0x9f, 0x07, 0x93, 0xc4, 0xc7, 0x97, 0xd8, 0x9a])
            
    };
            
            


    
         
            

export default Resources;
