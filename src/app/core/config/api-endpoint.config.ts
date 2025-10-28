export const API_ENDPOINTS = {
    DATAPOINT_ADMIN: {
        ENTITY: {
            GET_LIST: 'entity/getEntity',
            CREATE: 'entity/createEntity',
            UPDATE: 'entity/updateEntity',
            GET_DETAILS: 'entity/getEntity/',
            GET_ATTRIBUTES: 'entity/getAttributes',
            GET_ENTITY_DETAILS: 'entity/getEntityDetails/',
            GET_LOGS: 'entity/getLogs'
        },
        INSTANCE: {
            GET_LIST: 'instance/getInstance/',
            CREATE: 'instance/createInstance',
            UPDATE: 'instance/updateInstance'
        },
        FLAGS: {
            GET_LIST: 'flag/getFlag/',
            CREATE: 'flag/postFlag',
            UPDATE: 'flag/updateFlag',
        },
        EVENTS: {
            GET_LIST: 'event/getEvent/',
            CREATE: 'event/postEvent'
        },
        ATTRIBUTES: {
            GET_FILTERED: 'attribute/getFilteredAttributes'
        },
        NOTIFICATIONS: {
            CREATE: 'notification/postNotification',
            GET: 'notification/getNotifications/',
            UPDATE: 'notification/updateNotification',
            DELETE: 'notification/deleteNotification/'
        },
    },
    ORG_ADMIN: {
        ROLES: {
            GET_LIST: 'roles/getRoles',
            GET_FILTERED_ROLES: 'roles/getFilteredRoles'
        },
        APPS: {
            FREQS: {
                GET_LIST: 'app/freq/getFreq/',
                CREATE: 'app/freq/createFreq',
                UPDATE: 'app/freq/updateFreq',
                DELETE: 'app/freq/deleteFreq/'
            }
        },
        LOGS: {
            CREATE: 'logger/postLog/'
        }
    },
    CALCULATION_ENGINE: {
        TEMPLATE: {

        },
        MAPPING: {
            GET_LIST: 'calc/getNewCalcuMapping'
        },
        EXCUETION: {
            RUN: 'calc/calculateEngine'
        }
    },

    CORRELATION_ENGINE: {
        TEMPLATE: {
            GET_LIST: 'calc/getCorrelationList',
            CREATE: 'calc/postCorrelation'
        },
        MAPPING: {
            GET_LIST: 'calc/getNewCalcuMapping'
        },
        EXCUETION: {
            RUN: 'calc/calculateEngine',
            PREVIEW: 'calc/previewCorrelationStages'
        },
    },
    ACTIVITY_ENGINE: {
        FUNCTION_MODELS: {
            GET_LIST: 'activity/getActivityFM',
            GET_FM: 'activity/getActivityFMById/',
            CREATE_FM: 'activity/postActivityFM'
        },
        STEPS: {
            GET_LIST: 'activity/getActivitySteps',
            CREATE_STEP: 'activity/postActivitySteps'
        },
        TEMPLATE: {
            GET_LIST: 'activity/getActivityTemplate',
            CREATE: 'activity/postActivityTemplate'
        },
        INSTANCES: {
            GET_LIST: 'activity/getActivityInstance'
        },
        EXCUETION: {
            RUN: 'activity/runActivityInstance',
            PREVIEW: 'activity/previewActivityInstance'
        },
    },
    PAGE_ADMIN: {
        CREATE_PAGE: 'idt/postIdt'
    },
    LANDING_PAGE: {
        GET_ONGOING_CARDS: 'idt/getCards'
    },
    LLM: {
        prompt: 'llm/postPrompt',
        prompt1: 'llm/postPrompt1',
        queryPrompt: 'proxy/chat-db'
    }
};