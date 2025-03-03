//@ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom';

import Cart from './Store/Cart';
import Checkout from './Store/Checkout';
import Confirmation from './Store/Confirmation';
import Header from './Store/Header';
import Home from './Store/Home';
import ItemDetails from './Store/ItemDetails';
import List from './Store/List';

import { CartContext } from './Store/CartContext';
import { StoreData } from './Store/StoreData';
import ThemeWrapper from './Store/ThemeWrapper';
import { CategoryDetails } from './interfaces/CategoryDetails';
import { CartItemDetails } from './interfaces/CartItemDetails';
import { initialize, Event } from '@harnessio/ff-javascript-client-sdk';
import './App.css';

function App() {
  const storeData = useMemo(() => new StoreData(), []);

  const [categories, setCategories] = useState<CategoryDetails[]>([]);
  const [cart, setCart] = useState(storeData.getCart());
  const [featureFlags, setFeatureFlags] = useState({});

  useEffect(() => {
    storeData.getCategories().then(data => setCategories(data));
  }, [storeData]);

  function updateCart(cart: CartItemDetails[]) {
    storeData.setCart(cart);
    setCart(cart);
  }

  useEffect(() => {
    const target = {
      identifier: "UID2234", // Unique user ID
      name: "User2", // Display name
      attributes: {
        tenant: "Tenant2",
        version: "2.0",
        role: "admin", // Example of extra attributes
      }
    };
  
    // Initialize Harness SDK with the target
    const cf = initialize(
      '670c420d-6085-442c-9276-840800fa8122', // Replace with your actual SDK key
      target,
      { baseUrl: 'https://config.ff.harness.io/api/1.0', eventUrl: 'https://events.ff.harness.io/api/1.0' }
    );
  
    // Listen for SDK events using 'Event' instead of 'SDKEvent'
    cf.on(Event.READY, flags => {
      console.log("SDK is READY", flags);
      setFeatureFlags(flags);
    });
  
    cf.on(Event.CHANGED, flagInfo => {
      console.log("Feature Flag CHANGED", flagInfo);
      if (flagInfo.deleted) {
        setFeatureFlags(currentFeatureFlags => {
          delete currentFeatureFlags[flagInfo.flag];
          return { ...currentFeatureFlags };
        });
      } else {
        setFeatureFlags(currentFeatureFlags => ({ ...currentFeatureFlags, [flagInfo.flag]: flagInfo.value }));
      }
    });
  
    return () => {
      cf?.close();
    };
  }, []);
  

  let className = featureFlags.myfirstff ? 'App.Left' : 'App';

  return (
    <ThemeWrapper>
      <CartContext.Provider value={{ cart, setCart: updateCart }}>
        <BrowserRouter>
          <div className={className}>
            <Header />
            <Routes>
              <Route path="/" element={<Home categories={categories} />} />
              <Route path="/list/:listId/:itemId" element={<ItemDetails />} />
              <Route path="/list/:listId" element={<List categories={categories} />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirm" element={<Confirmation />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartContext.Provider>
    </ThemeWrapper>
  );
}

export default App;