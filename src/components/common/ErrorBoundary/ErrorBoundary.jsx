import React, { Component } from 'react';
import React, { useState } from "react";
const t = useTranslations();

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught an error", error, info);
    }

    render() {
        if (this.state.hasError) {
            return <h1>{t('errorboundary.heading')}</h1>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
