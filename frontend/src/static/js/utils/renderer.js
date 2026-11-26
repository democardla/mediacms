import React, { useContext } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, theme as antTheme } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import { ThemeContext, ThemeProvider } from './contexts/ThemeContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { UserProvider } from './contexts/UserContext';
import { inEmbeddedApp } from './helpers';
import '../i18n';
import i18n from '../i18n';

function AntDesignProvider({ children }) {
    const { currentThemeMode } = useContext(ThemeContext);
    return (
        <ConfigProvider
            locale={i18n.language === 'zh-Hans' ? zhCN : enUS}
            theme={{
                algorithm: currentThemeMode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
                token: { borderRadius: 0 },
            }}
        >
            {children}
        </ConfigProvider>
    );
}

const AppProviders = ({ children }) => (
    <LayoutProvider>
        <ThemeProvider>
            <AntDesignProvider>
                <UserProvider>{children}</UserProvider>
            </AntDesignProvider>
        </ThemeProvider>
    </LayoutProvider>
);

import { PageHeader, PageSidebar } from '../components/page-layout';

const roots = new WeakMap();

function mount(container, element) {
    let root = roots.get(container);
    if (!root) {
        root = createRoot(container);
        roots.set(container, root);
    }
    flushSync(() => root.render(element));
}

export function renderPage(idSelector, PageComponent) {
    if (inEmbeddedApp()) {
        globalThis.document.body.classList.add('embedded-app');
        globalThis.document.body.classList.remove('visible-sidebar');

        const appContent = idSelector ? document.getElementById(idSelector) : undefined;

        if (appContent && PageComponent) {
            mount(
                appContent,
                <AppProviders>
                    <PageComponent />
                </AppProviders>
            );
        }

        return;
    }

    const appContent = idSelector ? document.getElementById(idSelector) : undefined;
    const appHeader = document.getElementById('app-header');
    const appSidebar = document.getElementById('app-sidebar');

    if (appContent && PageComponent) {
        mount(
            appContent,
            <AppProviders>
                {appHeader ? createPortal(<PageHeader />, appHeader) : null}
                {appSidebar ? createPortal(<PageSidebar />, appSidebar) : null}
                <PageComponent />
            </AppProviders>
        );
    } else if (appHeader && appSidebar) {
        mount(
            appSidebar,
            <AppProviders>
                {createPortal(<PageHeader />, appHeader)}
                <PageSidebar />
            </AppProviders>
        );
    } else if (appHeader) {
        mount(
            appHeader,
            <LayoutProvider>
                <ThemeProvider>
                    <AntDesignProvider>
                        <UserProvider>
                            <PageHeader />
                        </UserProvider>
                    </AntDesignProvider>
                </ThemeProvider>
            </LayoutProvider>
        );
    } else if (appSidebar) {
        mount(
            appSidebar,
            <AppProviders>
                <PageSidebar />
            </AppProviders>
        );
    }
}

export function renderEmbedPage(idSelector, PageComponent) {
    const appContent = idSelector ? document.getElementById(idSelector) : undefined;

    if (appContent && PageComponent) {
        mount(appContent, <PageComponent />);
    }
}
