

import React, { useState, useEffect, useCallback } from 'react';
import Chatbot from '@/components/Chatbot';
import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import Wishlist from '@/components/Wishlist';
import ProductDetailModal from '@/components/ProductDetailModal';
import AuthModal from '@/components/AuthModal';
import AdminDashboard from '@/components/admin/AdminDashboard';
import GuidedTour from '@/components/GuidedTour';
import OnboardingModal from '@/components/OnboardingModal';
import { getChatbotResponse, routeToAgent } from '@/services';
import * as authService from '@/services/authService';
import * as api from '@/api';
import type { Product, CartItem, ChatMessage, User, Category, ProductVariant } from '@/types';
import { AgentType, MessageSender } from '@/types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsToDisplay, setProductsToDisplay] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'products' | 'cart' | 'wishlist'>('products');
  const [activeCategory, setActiveCategory] = useState<string | 'All'>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.SYSTEM);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [forYouProducts, setForYouProducts] = useState<Product[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState<'hidden' | 'login' | 'register'>('hidden');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  const [appMode, setAppMode] = useState<'store' | 'admin'>('store');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);

  // --- THEME & LOCAL STORAGE ---
  useEffect(() => {
    const root = window.document.documentElement;
    const currentTheme = theme;
    const otherTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    root.classList.remove(otherTheme);
    root.classList.add(currentTheme);
    
    localStorage.setItem('agentfashion_theme', currentTheme);
  }, [theme]);
  
  // Single, consolidated useEffect for initial setup on component mount
  useEffect(() => {
    const initializeApp = async () => {
        let loggedInUser: User | null = null;
        let initialCart: CartItem[] = [];
        let initialWishlist: string[] = [];
        let initialPreferredCategories: string[] = [];
        let initialProducts: Product[] = [];
        let initialCategories: Category[] = [];

        // 1. Fetch data from API layer
        try {
            initialProducts = await api.fetchProducts();
            initialCategories = await api.fetchCategories();
            setAllProducts(initialProducts);
            setProductsToDisplay(initialProducts);
            setCategories(initialCategories);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }

        // 2. Load all data synchronously from localStorage
        try {
            const storedTheme = localStorage.getItem('agentfashion_theme');
            if (storedTheme === 'light' || storedTheme === 'dark') {
                setTheme(storedTheme);
            }

            loggedInUser = authService.getCurrentUser();
            
            // Load user-specific data only if logged in
            if (loggedInUser) {
                const storedCart = localStorage.getItem(`agentfashion_cart_${loggedInUser.id}`);
                if (storedCart) initialCart = JSON.parse(storedCart);

                const storedWishlist = localStorage.getItem(`agentfashion_wishlist_${loggedInUser.id}`);
                if (storedWishlist) initialWishlist = JSON.parse(storedWishlist);
            }
            
            const storedPrefs = localStorage.getItem('agentfashion_preferredCategories');
            if (storedPrefs) initialPreferredCategories = JSON.parse(storedPrefs);

            const hasCompletedOnboarding = localStorage.getItem('agentfashion_hasCompletedOnboarding');
            if (!hasCompletedOnboarding) {
                setShowOnboarding(true);
            } else {
                const hasCompletedTour = localStorage.getItem('agentfashion_hasCompletedTour');
                if (!hasCompletedTour) {
                    setIsTourOpen(true);
                }
            }
        } catch (error) {
            console.error("Failed to parse from localStorage", error);
        }

        // 3. Set state based on loaded data
        setCartItems(initialCart);
        setWishlist(initialWishlist);
        setPreferredCategories(initialPreferredCategories);
        if (loggedInUser) {
            setCurrentUser(loggedInUser);
        }
        
        // 4. Perform initial greeting logic
        const initialGreeting = async () => {
            if (messages.length > 0) return;
            setIsBotTyping(true);
            await new Promise(res => setTimeout(res, 1000));
            
            if (loggedInUser) {
                addMessage({
                    sender: MessageSender.BOT,
                    content: `Chào mừng trở lại, ${loggedInUser.fullname}!`,
                    agent: AgentType.SYSTEM,
                });
                
                await new Promise(res => setTimeout(res, 1200));

                const wishlistedProducts = initialProducts.filter(p => initialWishlist.includes(p.id));

                if (initialCart.length > 0) {
                    addMessage({
                        sender: MessageSender.BOT,
                        content: `Có vẻ bạn đã để lại vài món đồ trong giỏ hàng. Bạn có muốn hoàn tất đơn hàng không?`,
                        agent: AgentType.ORDER,
                    });
                } else if (wishlistedProducts.length > 0) {
                    const firstWishlistedItem = wishlistedProducts[0];
                    addMessage({
                        sender: MessageSender.BOT,
                        content: `Tôi thấy bạn đang để mắt tới "${firstWishlistedItem.name}". Bạn có muốn tôi giúp bạn phối đồ với nó không?`,
                        agent: AgentType.ADVISOR,
                    });
                } else {
                     addMessage({
                       sender: MessageSender.BOT,
                       content: "Bạn muốn tìm kiếm sản phẩm hay cần tôi tư vấn về phong cách hôm nay?",
                       agent: AgentType.SYSTEM,
                    });
                }
            } else {
                addMessage({
                    sender: MessageSender.BOT,
                    content: "Xin chào 👋, tôi là AgentFashion AI – hệ thống đa tác tử (Multi-Agent AI) giúp bạn chọn đồ, tìm sản phẩm, và đặt hàng thông minh. Bạn cần tìm gì hôm nay?",
                    agent: AgentType.SYSTEM,
                });
            }
            setIsBotTyping(false);
        };
        
        initialGreeting();
    };
    
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (currentUser) {
        localStorage.setItem(`agentfashion_cart_${currentUser.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, currentUser]);

  useEffect(() => {
    if (currentUser) {
        localStorage.setItem(`agentfashion_wishlist_${currentUser.id}`, JSON.stringify(wishlist));
    }
  }, [wishlist, currentUser]);

  // Effect for updating "For You" recommendations
    useEffect(() => {
        if(allProducts.length === 0) return;

        let recommendations: Product[] = [];
        let hasPersonalized = false;
    
        if (currentUser) {
            const wishlistedProducts = allProducts.filter(p => wishlist.includes(p.id));
            
            const cartProducts = cartItems.map(ci => ci.product);
            const allPersonalizedItems = [...cartProducts, ...wishlistedProducts];

            if (allPersonalizedItems.length > 0) {
                const interestedCategoryNames = [...new Set(allPersonalizedItems.map(item => item.category.name))];
                recommendations = allProducts
                    .filter(p => interestedCategoryNames.includes(p.category.name))
                    .filter(p => !cartItems.some(ci => ci.product.id === p.id) && !wishlist.includes(p.id))
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 8);
                hasPersonalized = true;
            }
        }

        if (!hasPersonalized && preferredCategories.length > 0) {
             recommendations = allProducts
                .filter(p => preferredCategories.includes(p.category.name))
                .sort(() => 0.5 - Math.random())
                .slice(0, 8);
        }
        
        setForYouProducts(recommendations);
    }, [currentUser, cartItems, wishlist, allProducts, preferredCategories]);


  const addMessage = (newMessage: Omit<ChatMessage, 'id'>) => {
    setMessages(prev => [...prev, { ...newMessage, id: Date.now() + Math.random() }]);
    if(newMessage.sender === MessageSender.BOT && newMessage.agent) {
        setActiveAgent(newMessage.agent);
    }
  };

  const handleSendMessage = useCallback(async (messageText: string) => {
    addMessage({ content: messageText, sender: MessageSender.USER });
    
    const agent = routeToAgent(messageText);
    setActiveAgent(agent);
    
    setIsBotTyping(true);
    setCurrentView('products');
    
    const botResponse = await getChatbotResponse(messageText);
    addMessage(botResponse);
    
    if (botResponse.suggestedProducts && botResponse.suggestedProducts.length > 0) {
        if(botResponse.agent === AgentType.ADVISOR) {
          setRecommendedProducts(botResponse.suggestedProducts);
        } else {
          setProductsToDisplay(botResponse.suggestedProducts);
          const categoryName = botResponse.suggestedProducts[0].category.name;
          setActiveCategory(categoryName);
          setRecommendedProducts([]);
        }
    }

    setIsBotTyping(false);
  }, []);
  
  const requireAuth = (actionName: string): boolean => {
      if (!currentUser) {
        setAuthError(null);
        setAuthModal('login');
        addMessage({
            sender: MessageSender.BOT,
            content: `Bạn cần đăng nhập để ${actionName}. Vui lòng đăng nhập hoặc đăng ký nhé!`,
            agent: AgentType.SYSTEM,
        });
        return false;
      }
      return true;
  }

  const handleAddToCart = useCallback((product: Product, variant: ProductVariant, quantity: number) => {
    if (!requireAuth('thêm sản phẩm vào giỏ hàng')) return;
    
    setCartItems(prevItems => {
      const itemExists = prevItems.find(item => item.variant.id === variant.id);
      if (itemExists) {
        return prevItems.map(item =>
          item.variant.id === variant.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      const newCartItem: CartItem = {
          id: crypto.randomUUID(),
          userId: currentUser!.id,
          product,
          variant,
          quantity,
          createdAt: new Date().toISOString(),
      };
      return [...prevItems, newCartItem];
    });
    addMessage({
        sender: MessageSender.BOT,
        content: `Đã thêm "${product.name}" (${variant.size || ''} - ${variant.color || ''}) vào giỏ hàng!`,
        agent: AgentType.ORDER,
    });
  }, [currentUser]);

  const handleRemoveFromCart = useCallback((variantId: string) => {
      setCartItems(prev => prev.filter(item => item.variant.id !== variantId));
  }, []);

  const handleUpdateCartQuantity = useCallback((variantId: string, newQuantity: number) => {
      if (newQuantity < 1) {
          handleRemoveFromCart(variantId);
          return;
      }
      setCartItems(prev => prev.map(item => item.variant.id === variantId ? { ...item, quantity: newQuantity } : item));
  }, [handleRemoveFromCart]);


  const handleToggleWishlist = useCallback((productId: string) => {
    if (!requireAuth('thêm sản phẩm vào wishlist')) return;

    setWishlist(prev => {
        const isWishlisted = prev.includes(productId);
        if (isWishlisted) {
            return prev.filter(id => id !== productId);
        } else {
            return [...prev, productId];
        }
    });
  }, [currentUser]);

  const handleFilterChange = useCallback((categoryName: string | 'All') => {
    setActiveCategory(categoryName);
    setRecommendedProducts([]);
    if(categoryName === 'All'){
        setProductsToDisplay(allProducts);
    } else {
        setProductsToDisplay(allProducts.filter(p => p.category.name === categoryName));
    }
  }, [allProducts]);
  
  const handleCheckout = () => {
    if (!requireAuth('hoàn tất thanh toán')) return;

    if(cartItems.length > 0) {
        handleSendMessage("xác nhận đơn hàng");
        setCartItems([]);
        setCurrentView('products');
    }
  };

  const handleAuthClick = (view: 'login' | 'register') => {
    setAuthError(null);
    setAuthModal(view);
  };
  
  const handleLogin = async (email: string, password: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    const result = await authService.login(email, password);
    if (result.user) {
      setCurrentUser(result.user);
      setAuthModal('hidden');
      // Load user-specific data after login
      const storedCart = localStorage.getItem(`agentfashion_cart_${result.user.id}`);
      if (storedCart) setCartItems(JSON.parse(storedCart));
      const storedWishlist = localStorage.getItem(`agentfashion_wishlist_${result.user.id}`);
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

    } else {
      setAuthError(result.error || 'Đã có lỗi xảy ra.');
    }
    setIsAuthLoading(false);
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    const result = await authService.register(name, email, password);
    if (result.user) {
        await handleLogin(email, password); // Automatically log in after registration
    } else {
      setAuthError(result.error || 'Đã có lỗi xảy ra.');
    }
    setIsAuthLoading(false);
  };
  
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCartItems([]);
    setWishlist([]);
    setAppMode('store');
  };

    const handleNextStep = () => {
        if (tourStep < 4) { // 4 is the last step index (5 steps total)
            setTourStep(prev => prev + 1);
        } else {
            handleSkipTour(); // Finish tour
        }
    };

    const handlePrevStep = () => {
        if (tourStep > 0) {
            setTourStep(prev => prev - 1);
        }
    };

    const handleSkipTour = () => {
        setIsTourOpen(false);
        localStorage.setItem('agentfashion_hasCompletedTour', 'true');
    };

    const handleOnboardingComplete = (selectedCategoryNames: string[]) => {
        setPreferredCategories(selectedCategoryNames);
        localStorage.setItem('agentfashion_preferredCategories', JSON.stringify(selectedCategoryNames));
        localStorage.setItem('agentfashion_hasCompletedOnboarding', 'true');
        setShowOnboarding(false);

        const hasCompletedTour = localStorage.getItem('agentfashion_hasCompletedTour');
        if (!hasCompletedTour) {
            setIsTourOpen(true);
        }
    };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistedItems = allProducts.filter(p => wishlist.includes(p.id));

  const renderCurrentView = () => {
    switch (currentView) {
      case 'cart':
        return <Cart 
                    cartItems={cartItems} 
                    onClose={() => setCurrentView('products')} 
                    onCheckout={handleCheckout} 
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onRemoveItem={handleRemoveFromCart}
                />;
      case 'wishlist':
        return <Wishlist 
            wishlistItems={wishlistedItems} 
            onClose={() => setCurrentView('products')}
            onRemoveFromWishlist={handleToggleWishlist}
            onProductClick={setSelectedProduct} // Open modal instead of direct add
            />;
      case 'products':
      default:
        return <ProductGrid 
                  products={productsToDisplay}
                  categories={categories} 
                  recommendations={recommendedProducts}
                  forYouProducts={forYouProducts}
                  onProductClick={setSelectedProduct}
                  onFilterChange={handleFilterChange}
                  activeCategory={activeCategory}
                  onToggleWishlist={handleToggleWishlist}
                  wishlist={wishlist}
                />;
    }
  }

  if (appMode === 'admin') {
    return <AdminDashboard 
            onExitAdmin={() => setAppMode('store')}
            products={allProducts}
            setProducts={setAllProducts}
            chatMessages={messages}
           />
  }

  return (
    <div className="h-screen w-screen flex flex-col font-sans text-gray-900 dark:text-gray-100">
      <Header 
        cartItemCount={cartItemCount}
        wishlistItemCount={wishlist.length} 
        onCartClick={() => setCurrentView('cart')}
        onWishlistClick={() => setCurrentView('wishlist')}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAuthClick={handleAuthClick}
        onAdminClick={() => setAppMode('admin')}
        theme={theme}
        onThemeToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      />
      <main className="flex-grow flex overflow-hidden">
        <Chatbot 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isBotTyping={isBotTyping}
            onProductClick={setSelectedProduct}
            activeAgent={activeAgent}
        />
        <div className="flex-grow h-full overflow-y-auto bg-gray-100 dark:bg-slate-900">
          {renderCurrentView()}
        </div>
      </main>
      {authModal !== 'hidden' && (
        <AuthModal 
            initialView={authModal}
            onClose={() => setAuthModal('hidden')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            error={authError}
            isLoading={isAuthLoading}
        />
      )}
      {selectedProduct && (
        <ProductDetailModal 
            product={selectedProduct}
            relatedProducts={allProducts.filter(p => p.category.id === selectedProduct.category.id && p.id !== selectedProduct.id).slice(0, 4)}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onProductClick={setSelectedProduct}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlist.includes(selectedProduct.id)}
        />
      )}
       {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
       {isTourOpen && !showOnboarding && (
        <GuidedTour 
            currentStep={tourStep}
            onNext={handleNextStep}
            onBack={handlePrevStep}
            onClose={handleSkipTour}
        />
      )}
    </div>
  );
};

export default App;
