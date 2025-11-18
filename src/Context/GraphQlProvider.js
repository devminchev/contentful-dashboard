/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import React, { createContext, useState, useEffect } from 'react';
import { useSDK } from "@contentful/react-apps-toolkit";

const client = axios.create({
  baseURL: `https://graphql.contentful.com/content/v1/spaces/`,
  headers: {
    'Content-Type': 'application/json'
  }
});

const setHeaders = (spaceId) => ({
  Authorization: `Bearer ${spaceId === 'nw2595tc1jdx' ? process.env.REACT_APP_GRAPHQL_TOKEN_UK : process.env.REACT_APP_GRAPHQL_TOKEN_US}`,
  'Content-Type': 'application/json'
});

const sectionsWithAllGamesQuery = `
  query($locale: String) {
    sectionCollection(limit: 1000, locale: $locale, where: {
      gamesCollection_exists: true,
      OR: [
        { entryTitle_contains: "all" },
        { entryTitle_contains: "a-z" },
        { entryTitle_contains: "a-m" },
        { entryTitle_contains: "n-z" }
      ]
    }) {
      items {
        sys {
          id
        }
        title
        name
        entryTitle
      }
    }
  }
`;

const siteGamesRefsQuery = `
  query($preview: Boolean, $sectionId: String!, $locale: String) {
    section(preview: $preview, id: $sectionId) {
      sys {
        id
      }
      gamesCollection(limit: 1000, where: { sys: { id_exists: true } }) {
        items {
          __typename
          ... on SiteGame {
            sys {
              id
            }
            game {
              gameInfo(locale: $locale) {
                title
              }
            }
          }
          ... on SiteGameV2 {
            __typename
            sys {
              id
            }
            game {
              title(locale: $locale)
            }
          }
        }
      }
    }
  }
`;

const siteGameV2LinksQuery = `
query ($limit: Int, $skip: Int, $filters: SiteGameV2Filter){
  siteGameV2Collection(limit: $limit, skip: $skip, where: $filters) {
    items {
      sys {
        id
      }
      entryTitle
      environment
      linkedFrom {
        sectionCollection {
          total
        }
      }
    }
    total
  }
}
`;

const variables = {
  preview: true,
  limit: 100
};

export const defaultValues = {
  getAllGamesSections: null,
  getV1SitegameRefs: null,
  getSiteGameV2Links: null,
  isClientReady: false,
  queryProgress: 0,
  indexList: [],
  setQueryProgress: () => { }
};

export const GraphQlContext = createContext(defaultValues);

export const GraphQlProvider = ({ children }) => {
  const { ids } = useSDK();
  const [state, setState] = useState({ ...defaultValues });

  const setGraphQlGetClient = () => {
    setState((currentValues) => ({
      ...currentValues,
      getAllGamesSections: () => client.get(`${ids.space}/environments/${ids.environment}`, {
        params: { query: sectionsWithAllGamesQuery, variables: JSON.stringify(variables) },
        headers: setHeaders(ids.space)
      }),
      getV1SitegameRefs: (sectionId, locale) => client.get(`${ids.space}/environments/${ids.environment}`, {
        params: { query: siteGamesRefsQuery, variables: JSON.stringify({ ...variables, sectionId, locale }) },
        headers: setHeaders(ids.space)
      }),
      getSiteGameV2Links: (skip, filters) => client.get(`${ids.space}/environments/${ids.environment}`, {
        params: { query: siteGameV2LinksQuery, variables: JSON.stringify({ ...variables, skip, filters }) },
        headers: setHeaders(ids.space)
      }),
      isClientReady: true
    }));
  };

  const setQueryProgress = (val) => {
    setState((currentValues) => ({
      ...currentValues,
      queryProgress: val
    }));
  };

  useEffect(() => {
    if (!state.isClientReady) {
      setGraphQlGetClient();
    };
  }, [state.isClientReady]);

  return (state.isClientReady &&
    <GraphQlContext.Provider value={{ ...state, setQueryProgress }}>
      {children}
    </GraphQlContext.Provider>
  );
};
