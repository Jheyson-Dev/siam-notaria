import React, { useState } from 'react';
import SearchForm from './SearchForm_x_dni_ruc';
import ResultsGrid from './ResultsGrid_cnt_en_municipalidades';
import ErrorBoundary from '../ErrorBoundary';
import PasswordAlert from './PasswordAlert';

const Dashboard = () => {
    let user = {};
    try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
        console.error("Error parsing user from localStorage", e);
        user = {};
    }
    const [searchResults, setSearchResults] = useState(null);

    const handleSearchResults = (results) => {
        setSearchResults(results);
    };

    return (
        <div className="space-y-4 animate-slide-up">
            <PasswordAlert user={user} />

            {/* Content Section */}
            <div className="grid grid-cols-1 gap-4">
                <section className="animate-fade-scale" style={{ animationDelay: '0.1s' }}>
                    <SearchForm onSearchResults={handleSearchResults} user={user} />
                </section>

                {/* Results Section */}
                {searchResults && (
                    <div className="transition-all duration-700 ease-in-out transform origin-top">
                        <ErrorBoundary>
                            <ResultsGrid results={searchResults} />
                        </ErrorBoundary>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
