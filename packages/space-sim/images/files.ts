import starsLarge from "./stars/TychoSkymapII.t5_16384x08192.jpg?url"
import starsSmall from "./stars/TychoSkymapII.t4_04096x02048.jpg?url"

import moonLarge from "./moon/lroc_color_poles_4k.jpg?url"
import moonSmall from "./moon/lroc_color_poles_1k.jpg?url"
import moonNormal from "./moon/ldem_3_8bit.jpg?url"
import moonNight from "./moon/darkside_2048.jpg?url"

import earthNightLarge from "./earth/earth_vir_2016_lrg.jpg?url"
import earthNightLargeAlt from "./earth/earth_vir_2016_lrg_2.jpg?url"
import earthNightSmall from "./earth/earth_vir_2016.jpg?url"
import earthNightSmallAlt from "./earth/earth_vir_2016_2.jpg?url"
import earthNormal from "./earth/gebco_08_rev_elev_21600x10800.png?url"
import earthNormalAlt from "./earth/8k_earth_normal_map.jpg?url"
import earthSpecular from "./earth/gebco_08_rev_bath_3600x1800_color.jpg?url"
import earthSpecularAlt from "./earth/8k_earth_specular_map.jpg?url"
import earthClouds from "./earth/cloud_combined_2048.png?url"
import earthCloudsAlt from "./earth/Transparent_Fair_Weather_Clouds_Mapx2048x1024.png"

import earthLargeJan from "./earth/world.200401.3x5400x2700.jpg?url"
import earthLargeFeb from "./earth/world.200402.3x5400x2700.jpg?url"
import earthLargeMar from "./earth/world.200403.3x5400x2700.jpg?url"
import earthLargeApr from "./earth/world.200404.3x5400x2700.jpg?url"
import earthLargeMay from "./earth/world.200405.3x5400x2700.jpg?url"
import earthLargeJun from "./earth/world.200406.3x5400x2700.jpg?url"
import earthLargeJul from "./earth/world.200407.3x5400x2700.jpg?url"
import earthLargeAug from "./earth/world.200408.3x5400x2700.jpg?url"
import earthLargeSep from "./earth/world.200409.3x5400x2700.jpg?url"
import earthLargeOct from "./earth/world.200410.3x5400x2700.jpg?url"
import earthLargeNov from "./earth/world.200411.3x5400x2700.jpg?url"
import earthLargeDec from "./earth/world.200412.3x5400x2700.jpg?url"

import earthSmallJan from "./earth/world.200401.3x2048x1024.jpg?url"
import earthSmallFeb from "./earth/world.200402.3x2048x1024.jpg?url"
import earthSmallMar from "./earth/world.200403.3x2048x1024.jpg?url"
import earthSmallApr from "./earth/world.200404.3x2048x1024.jpg?url"
import earthSmallMay from "./earth/world.200405.3x2048x1024.jpg?url"
import earthSmallJun from "./earth/world.200406.3x2048x1024.jpg?url"
import earthSmallJul from "./earth/world.200407.3x2048x1024.jpg?url"
import earthSmallAug from "./earth/world.200408.3x2048x1024.jpg?url"
import earthSmallSep from "./earth/world.200409.3x2048x1024.jpg?url"
import earthSmallOct from "./earth/world.200410.3x2048x1024.jpg?url"
import earthSmallNov from "./earth/world.200411.3x2048x1024.jpg?url"
import earthSmallDec from "./earth/world.200412.3x2048x1024.jpg?url"

import habitatLarge from "./habitat/photos_2015_12_8_fst_785695bfe87-bef4-482a-8fd7-9543ccc63873.jpg?url"  // FIXME
//import habitatLarge from "./habitat/photos_2017_11_10_fst_grass-lawn-texture.jpg?url"  // FIXME
import habitatNormal from "./moon/ldem_3_8bit.jpg?url"
import habitatNight from "./moon/darkside_2048.jpg"


export const imageFiles = {
    stars: {
        large: starsLarge,
        small: starsSmall,
    },

    earth: {
        night: {
            large: earthNightLarge,
            small: earthNightSmall,
        },
        normal: earthNormal,
        specular: earthSpecular,
        clouds: earthClouds,

        large: [
            earthLargeJan, earthLargeFeb, earthLargeMar, earthLargeApr,
            earthLargeMay, earthLargeJun, earthLargeJul, earthLargeAug,
            earthLargeSep, earthLargeOct, earthLargeNov, earthLargeDec,
        ],
        small: [
            earthSmallJan, earthSmallFeb, earthSmallMar, earthSmallApr,
            earthSmallMay, earthSmallJun, earthSmallJul, earthSmallAug,
            earthSmallSep, earthSmallOct, earthSmallNov, earthSmallDec,
        ],
    },

    earthAlt: {
        night: {
            large: earthNightLargeAlt,
            small: earthNightSmallAlt,
        },
        normal: earthNormalAlt,
        specular: earthSpecularAlt,
        clouds: earthCloudsAlt,

        large: [
            earthLargeJan, earthLargeFeb, earthLargeMar, earthLargeApr,
            earthLargeMay, earthLargeJun, earthLargeJul, earthLargeAug,
            earthLargeSep, earthLargeOct, earthLargeNov, earthLargeDec,
        ],
        small: [
            earthSmallJan, earthSmallFeb, earthSmallMar, earthSmallApr,
            earthSmallMay, earthSmallJun, earthSmallJul, earthSmallAug,
            earthSmallSep, earthSmallOct, earthSmallNov, earthSmallDec,
        ],
    },

    moon: {
        large: moonLarge,
        small: moonSmall,
        normal: moonNormal,
        night: moonNight,
    },

    habitats: [
        {
            large: habitatLarge,
            normal: habitatNormal,
            night: habitatNight,
        }
    ]
}