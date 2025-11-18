/* eslint-disable react-hooks/exhaustive-deps */
import { useSDK } from '@contentful/react-apps-toolkit';
import React, { useEffect } from 'react';

function ContentfulListener() {
  const sdk = useSDK();

  useEffect(() => {
    if (sdk && sdk.entry) {
      const detachSysListener = sdk.entry.onSysChanged(sys => {
        if (sys.lifecycleEvent === 'publish') {
          console.log('Entry has been published!');
        }
      });

      // Cleanup the listener when the component is unmounted
      return () => {
        detachSysListener();
      };
    }
  }, []);

  return <div>Listening to Contentful publish events...</div>;
}

export default ContentfulListener;
