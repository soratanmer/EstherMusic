import { createI18n } from 'vue-i18n'
import store from '@render/store'

import en from '@render/locale/lang/en.json'
import zhCN from '@render/locale/lang/zh-CN.json'
import zhTW from '@render/locale/lang/zh-TW.json'
import tr from '@render/locale/lang/tr.json'

const i18n = createI18n({
    locale: store.state.settings.lang,
    messages: {
        en,
        'zh-CN': zhCN,
        'zh-TW': zhTW,
        tr,
    },
})

export default i18n
