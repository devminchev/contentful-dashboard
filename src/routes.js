import Home from './Home/Home';
import Release from './Release/Release';
import AtoZSectionsGames from './AtoZSectionsGames/AtoZSectionsGames';
import SiteGameOperations from './SiteGameOperations/SiteGameOperations';
import CacheManagement from './CacheManagement/CacheManagement';
import OpensearchContentSync from './OpensearchContentSync/OpensearchContentSync';
import OpensearchContentSyncV3 from './OpensearchContentSync/OpensearchContentSyncV3';
import OSV3IndexManagement from './OpensearchContentSync/OpensearchNonProdIndexManagement';
import TeamContentStats from './TeamContentStats/TeamContentStats';
import UnlinkedSiteGames from './SiteGameOperations/UnlinkedSiteGames';
import SectionConverter from './SectionConverter/SectionConverter';
import GameMetadataUploadByMasterTemplate from './GameMetadataUpload/GameMetadataUploadByMasterTemplate';

export const ROUTE_PERMISSIONS = {
    RESTRICTED_NIGHTWATCH: 'restrictedNightWatch',
    RESTRICTED_ADMIN: 'restrictedAdmin',
    RESTRICTED_SUPER_USER: 'restrictedSuperUsers'
};

export const routes = () => [
    {
        name: 'Home',
        exact: true,
        path: '/',
        meta: {
            description: 'Home',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'home'
                }
            },
            title: 'Home'
        },
        label: 'Home',
        component: Home
    },
    {
        name: 'Section Converter',
        exact: true,
        path: '/section-converter',
        meta: {
            description: 'Convert IG sections from one model type to another',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'section converter migration'
                }
            },
            title: 'Section Converter'
        },
        label: 'Section Converter',
        component: SectionConverter
    },
    {
        name: 'A-Z Section Games',
        exact: true,
        path: '/az-section-games',
        meta: {
            description: 'Page for content metadata of all-games related data',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'tag metadata'
                }
            },
            title: '/az-section-games'
        },
        label: '/az-section-games',
        component: AtoZSectionsGames
    },
    {
        name: 'SiteGame Operations',
        exact: true,
        path: '/site-game-operations',
        meta: {
            description: 'Page for content metadata of site game related data',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'tag metadata'
                }
            },
            title: 'site-game-operations'
        },
        label: 'site-game-operations',
        component: SiteGameOperations
    },
    {
        name: 'Unlinked SiteGame Filter',
        exact: true,
        path: '/unlinked-site-game-filter',
        meta: {
            description: 'Page for content metadata of site game related data',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'tag metadata'
                }
            },
            title: 'Unlinked SiteGame Filter'
        },
        label: 'unlinked-siteGame-filter',
        component: UnlinkedSiteGames
    },
    {
        name: 'Team Content Stats',
        exact: true,
        path: '/team-content-stats',
        meta: {
            description: 'Page for content metadata of team related data',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'tag metadata'
                }
            },
            title: 'Team Content Stats'
        },
        label: 'team-content-stats',
        component: TeamContentStats
    },
    {
        name: 'Release Automation',
        exact: true,
        path: '/release-automation',
        meta: {
            description: 'Page for content metadata of releases related data',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'tag metadata'
                }
            },
            title: 'releases'
        },
        label: 'releases',
        component: Release,
        permission: ROUTE_PERMISSIONS.RESTRICTED_ADMIN
    },
    {
        name: 'Metadata Upload (GameV2)',
        exact: true,
        path: '/metadata-upload-game',
        meta: {
            description: 'Page for uploading metadata excel doc for gameV2 content',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'tag metadata'
                }
            },
            title: 'Metadata Upload (GameV2)'
        },
        label: 'GameMetadataUpload',
        component: GameMetadataUploadByMasterTemplate
    },
    {
        name: 'Cache Management(LiveEU)',
        exact: true,
        path: '/cache-management',
        meta: {
            description: 'Page for content metadata of cached data',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'tag metadata'
                }
            },
            title: 'cache-management'
        },
        label: 'cache-management',
        component: CacheManagement
    },
    {
        name: 'Legacy Contentful-Opensearch Data Sync',
        exact: true,
        path: '/opensearch-content-sync',
        meta: {
            description: 'Page for content metadata of Opensearch Content Sync',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'tag metadata'
                }
            },
            title: 'Legacy Opensearch Content Sync'
        },
        label: 'Legacy Opensearch Content Sync',
        component: OpensearchContentSync,
        permission: ROUTE_PERMISSIONS.RESTRICTED_NIGHTWATCH
    },
    {
        name: 'V3 Contentful-Opensearch Data Sync',
        exact: true,
        path: '/opensearch-content-sync-na',
        meta: {
            description: 'Page for content metadata of Opensearch Content Sync for NA',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'tag metadata'
                }
            },
            title: 'V3 Opensearch Content Sync'
        },
        label: 'V3 Opensearch Content Sync',
        component: OpensearchContentSyncV3,
        permission: ROUTE_PERMISSIONS.RESTRICTED_NIGHTWATCH
    },
    {
        name: 'OSV3 Index Management',
        exact: true,
        path: '/opensearch-content-management-v3',
        meta: {
            description: 'Page for Non-prod OpenSearch index cleanup before sync',
            meta: {
                charSet: 'utf-8',
                name: {
                    keywords: 'tag metadata'
                }
            },
            title: 'OSV3 Index Management'
        },
        label: 'OSV3 Index Management',
        component: OSV3IndexManagement,
        permission: ROUTE_PERMISSIONS.RESTRICTED_SUPER_USER
    }
];

export default routes;
