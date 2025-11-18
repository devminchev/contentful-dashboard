export const opsAdminRolesBackup = {
    'Game Ops Admin': {
        "name": "Game Ops Admin",
        "description": "Games editing and publishing on site including games patches and any layout on the pages",
        "policies": [
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "cashierGameConfig"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "cashierRegulatoryDataGameConfig"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "categories"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "category"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "game"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "gameConfig"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "gameInfo"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "jurisdiction"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "layout"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "localisation"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "miniGames"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "recommendedGames"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "section"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sectionSiteGame"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "site"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "siteGame"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "venture"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "footer"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "footerIcon"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "footerLink"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreButton"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "krePage"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreSection"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreSmallText"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreYoti"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberAnswer"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberQuestion"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberQuestionnaire"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberTheme"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "policy"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgButton"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnaireResultScreen"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnairePage"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnaireWelcomeScreen"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnaireScreen"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsLink"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsMarquee"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsMarqueeCustomTile"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsMarqueeJudoTile"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsQuickLinks"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Asset"
                            ]
                        }
                    ]
                },
                "actions": "all"
            }
        ],
        "permissions": {
            "ContentModel": [
                "read"
            ],
            "Settings": [],
            "ContentDelivery": [],
            "Environments": "all",
            "EnvironmentAliases": [],
            "Tags": []
        },
        "sys": {
            "type": "Role",
            "id": "6ssOumoevlm4JM3APF6a5p",
            "version": 2,
            "space": {
                "sys": {
                    "type": "Link",
                    "linkType": "Space",
                    "id": "nw2595tc1jdx"
                }
            },
            "createdBy": {
                "sys": {
                    "type": "Link",
                    "linkType": "User",
                    "id": "4oVioXGKwdzF6JZkT0mW9f"
                }
            },
            "createdAt": "2022-10-25T15:37:16Z",
            "updatedBy": {
                "sys": {
                    "type": "Link",
                    "linkType": "User",
                    "id": "4oVioXGKwdzF6JZkT0mW9f"
                }
            },
            "updatedAt": "2022-10-26T09:28:19Z"
        }
    },
    'Product Ops Admin': {
        "name": "Product Ops Admin",
        "description": "Edit the layout, including sections and games tiles. They cannot do games patches, change the games or edit the actual content (icasino or sports) on site",
        "policies": [
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "categories"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "category"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "jurisdiction"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "layout"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "localisation"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "section"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sectionSiteGame"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "site"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "venture"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "siteGame"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "gameInfo"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "recommendedGames"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "cashierGameConfig"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "cashierRegulatoryDataGameConfig"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "footer"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "footerIcon"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "footerLink"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "game"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "gameConfig"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreButton"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "krePage"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreSection"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreSmallText"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreYoti"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberAnswer"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberQuestion"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberQuestionnaire"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberTheme"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "miniGames"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "policy"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgButton"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnaireResultScreen"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnairePage"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnaireScreen"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnaireWelcomeScreen"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsLink"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsMarquee"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsMarqueeCustomTile"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsMarqueeJudoTile"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsQuickLinks"
                            ]
                        }
                    ]
                },
                "actions": "all"
            }
        ],
        "permissions": {
            "ContentModel": [
                "read"
            ],
            "Settings": [],
            "ContentDelivery": [],
            "Environments": "all",
            "EnvironmentAliases": [],
            "Tags": []
        },
        "sys": {
            "type": "Role",
            "id": "2jPzkJy1EOZDpJ7zCJKtjC",
            "version": 15,
            "space": {
                "sys": {
                    "type": "Link",
                    "linkType": "Space",
                    "id": "nw2595tc1jdx"
                }
            },
            "createdBy": {
                "sys": {
                    "type": "Link",
                    "linkType": "User",
                    "id": "49WTvOyuXYVsHKkPTnCDig"
                }
            },
            "createdAt": "2020-01-16T16:08:03Z",
            "updatedBy": {
                "sys": {
                    "type": "Link",
                    "linkType": "User",
                    "id": "4oVioXGKwdzF6JZkT0mW9f"
                }
            },
            "updatedAt": "2023-03-15T11:30:11Z"
        }
    },
    'Release Admin': {
        "name": "Release Admin",
        "description": "Games editing and publishing on site including games patches and any layout on the pages",
        "policies": [
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "cashierGameConfig"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "cashierRegulatoryDataGameConfig"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "categories"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "category"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "game"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "gameConfig"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "gameInfo"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "jurisdiction"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "layout"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "localisation"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "miniGames"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "recommendedGames"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "section"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sectionSiteGame"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "site"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "siteGame"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "venture"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "footer"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "footerIcon"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "footerLink"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreButton"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "krePage"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreSection"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreSmallText"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "kreYoti"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberAnswer"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberQuestion"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberQuestionnaire"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "memberTheme"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "policy"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgButton"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnaireResultScreen"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnairePage"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnaireWelcomeScreen"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "rgQuestionnaireScreen"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsLink"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsMarquee"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsMarqueeCustomTile"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsMarqueeJudoTile"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "deny",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Entry"
                            ]
                        },
                        {
                            "equals": [
                                {
                                    "doc": "sys.contentType.sys.id"
                                },
                                "sportsQuickLinks"
                            ]
                        }
                    ]
                },
                "actions": "all"
            },
            {
                "effect": "allow",
                "constraint": {
                    "and": [
                        {
                            "equals": [
                                {
                                    "doc": "sys.type"
                                },
                                "Asset"
                            ]
                        }
                    ]
                },
                "actions": "all"
            }
        ],
        "permissions": {
            "ContentModel": [
                "read"
            ],
            "Settings": [],
            "ContentDelivery": [],
            "Environments": "all",
            "EnvironmentAliases": [],
            "Tags": []
        },
        "sys": {
            "type": "Role",
            "id": "2Wt23RyP07QnRUZMriYJi2",
            "version": 0,
            "space": {
                "sys": {
                    "type": "Link",
                    "linkType": "Space",
                    "id": "nw2595tc1jdx"
                }
            },
            "createdBy": {
                "sys": {
                    "type": "Link",
                    "linkType": "User",
                    "id": "1MsR7uvzVI0ZSqp2jbjsMU"
                }
            },
            "createdAt": "2024-01-15T18:18:16Z",
            "updatedBy": {
                "sys": {
                    "type": "Link",
                    "linkType": "User",
                    "id": "1MsR7uvzVI0ZSqp2jbjsMU"
                }
            },
            "updatedAt": "2024-01-15T18:18:16Z"
        }
    }
};
