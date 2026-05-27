'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';
import CategoryFilterLink from './products/CategoryFilterLink';

interface MenuItem {
  name: string;
  href: string;
  external?: boolean;
  isCategory?: boolean;
  categorySlug?: string;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

interface MobileMenuButtonsProps {
  openLabel: string;
  closeLabel: string;
  closeMenu?: () => void;
  user: any;
  lang: string;
  dict: any;
  navigation: Array<{ name: string; href: string }>;
  menuSections: MenuSection[];
  extraElements?: React.ReactNode[];
}

export default function MobileMenuButtons({ 
  openLabel, 
  closeLabel,
  closeMenu,
  lang,
  menuSections,
  extraElements
}: MobileMenuButtonsProps) {
  const [menuopen, setMenuopen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = () => setMenuopen(!menuopen);
  const closemenu = () => {
    setMenuopen(false);
    setActiveSection(null);
    if (closeMenu) {
      closeMenu();
    }
  };

  // Automatically close menu on route change
  useEffect(() => {
    if (menuopen) {
      setMenuopen(false);
      setActiveSection(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);


  // Mobile Accordion Chevron
  const MobileChevronIcon = () => (
    <svg 
      className="w-4 h-4 text-black/60 transition-transform duration-300 group-open:rotate-180" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <>
      <button 
        onClick={toggleMenu} 
        className="md:p-2 mr-2 z-[210] relative group" 
        aria-label={menuopen ? closeLabel : openLabel}
      >
        {menuopen ? (
          <svg
            className="w-5 h-5 md:w-7 md:h-7 text-text-main/80 group-hover:text-text-main transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5 md:w-7 md:h-7 text-text-main/80 group-hover:text-text-main transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>
      
      {menuopen &&
        createPortal(
          <div 
            className={`
              fixed inset-0 z-[200] flex
              ${isMobile 
                ? 'flex-col bg-black/20 backdrop-blur-sm' 
                : 'flex-row bg-black/30 backdrop-blur-md'
              }
            `}
            onClick={closemenu}
          >
            {/* MOBILE LAYOUT */}
            {isMobile ? (
              <div 
                className="relative w-full h-full bg-white overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closemenu}
                  className="absolute top-6 right-6 z-10 group"
                  aria-label={closeLabel}
                >
                  <svg
                    className="w-6 h-6 text-black/40 group-hover:text-black transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="p-6 pt-20">
                  {/* Main Navigation Links 
                  <nav className="flex flex-col space-y-5 mb-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-lg font-semibold uppercase text-black tracking-[0.15em] hover:text-black/60 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>*/}

                  {/* Dropdown Sections */}
                  <div className="flex flex-col w-full divide-y divide-gray-200 border-t border-gray-200">
                    {menuSections.map((section) => (
                      <details key={section.id} className="group py-5">
                        <summary className="flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                          <strong className="text-xs uppercase tracking-[0.2em] font-bold text-black">
                            {section.title}
                          </strong>
                          <MobileChevronIcon />
                        </summary>
                        <ul className="mt-4 space-y-2.5">
                          {section.items.map((item, idx) => (
                            <li key={idx}>
                              {item.isCategory ? (
                                <CategoryFilterLink 
                                  categorySlug={item.categorySlug!} 
                                  lang={lang} 
                                  className="text-black/80 text-sm tracking-wide hover:text-black hover:underline transition block w-full"
                                >
                                  {item.name}
                                </CategoryFilterLink>
                              ) : item.external ? (
                                <a 
                                  href={item.href} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-black/80 text-sm tracking-wide hover:text-black hover:underline transition block w-full"
                                >
                                  {item.name}
                                </a>
                              ) : (
                                <Link 
                                  href={item.href}
                                  className="text-black/80 text-sm tracking-wide hover:text-black hover:underline transition block w-full"
                                >
                                  {item.name}
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ))}
                  </div>

                  {/* User Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    
                    {extraElements && extraElements.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        {extraElements.map((element, index) => (
                          <div key={index}>{element}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* DESKTOP LAYOUT - Multi-level side panels */
              <div className="flex h-full" onClick={(e) => e.stopPropagation()}>
                {/* Main Menu Panel */}
                <div className="relative w-[380px] h-full bg-white shadow-md">
                  {/* Close Button */}
                  <button
                    onClick={closemenu}
                    className="absolute top-5 right-5 z-10 group"
                    aria-label={closeLabel}
                  >
                    <svg
                      className="w-6 h-6 text-black/30 group-hover:text-black transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <div className="py-16 flex flex-col justify-between h-full">
                    {/* Menu Sections with Right Arrow */}
                    <div className="flex flex-col space-y-1">
                      {menuSections.map((section) => (
                        <button
                          key={section.id}
                          onMouseEnter={() => setActiveSection(section.id)}
                          onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                          className={`
                            flex items-center justify-between w-full px-8 py-6 text-left
                            transition-colors group
                            ${activeSection === section.id 
                              ? 'bg-gray-100' 
                              : 'hover:bg-gray-50'
                            }
                          `}
                        >
                          <span className="text-xs uppercase tracking-[0.2em] font-bold text-black">
                            {section.title}
                          </span>
                          <FiChevronRight className={`
                            w-4 h-4 text-black/40 transition-transform
                            ${activeSection === section.id ? 'translate-x-1' : 'group-hover:translate-x-1'}
                          `} />
                        </button>
                      ))}
                    </div>

                    {/* User Actions */}
                    <div className="px-8">
                      
                      {extraElements && extraElements.length > 0 && (
                        <div className="pt-4 mt-4 border-t border-gray-200">
                          {extraElements.map((element, index) => (
                            <div key={index}>{element}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Secondary Panel - Shows when section is active */}
                {activeSection && (
                  <div 
                    className="w-[380px] h-full bg-white shadow-xl overflow-y-auto border-l border-gray-200"
                    onMouseLeave={() => setActiveSection(null)}
                  >
                    <div className="h-16 flex items-center px-8">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">
                        {menuSections.find(s => s.id === activeSection)?.title}
                      </h3>
                    </div>
                    <div>
                      <ul className="space-y-1">
                        {menuSections.find(s => s.id === activeSection)?.items.map((item, idx) => (
                          <li key={idx}>
                            {item.isCategory ? (
                              <CategoryFilterLink 
                                categorySlug={item.categorySlug!} 
                                lang={lang} 
                                className="text-xs uppercase tracking-[0.2em] font-bold text-black hover:bg-gray-50 hover:underline transition block px-8 py-6"
                              >
                                {item.name}
                              </CategoryFilterLink>
                            ) : item.external ? (
                              <a 
                                href={item.href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs uppercase tracking-[0.2em] font-bold text-black hover:bg-gray-50 hover:underline transition block px-8 py-6"
                              >
                                {item.name}
                              </a>
                            ) : (
                              <Link 
                                href={item.href}
                                className="text-xs uppercase tracking-[0.2em] font-bold text-black hover:bg-gray-50 hover:underline transition block px-8 py-6"
                              >
                                {item.name}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Backdrop - Click to close */}
                <div className="flex-1" onClick={closemenu} />
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}