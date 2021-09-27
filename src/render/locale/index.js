import { createI18n } from 'vue-i18n'
import store from '@render/store'

import enGB from '@render/locale/lang/en-GB.json'
import zhCHS from '@render/locale/lang/zh-CHS.json'
import zhCHT from '@render/locale/lang/zh-CHT.json'

const i18n = createI18n({
    locale: store.state.settings.lang,
    globalInjection: true,
    messages: {
        'en-GB': enGB,
        'zh-CHS': zhCHS,
        'zh-CHT': zhCHT,
    },
})

export default i18n
