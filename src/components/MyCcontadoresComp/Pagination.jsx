﻿// src/components/MyCcontadoresComp/Pagination.jsx

import React from 'react';

// Componente para el botón de navegación (Anterior/Siguiente)
function PageButton({ ariaLabel, src, altText, onClick, disabled }) {
    return (
        <button
            aria-label={ariaLabel}
            className={`focus:outline-none flex items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-75'}`}
            onClick={onClick}
            disabled={disabled}
        >
            <img
                loading="lazy"
                src={src}
                alt={altText}
                className="object-contain w-3 h-3 fill-indigo-500"
            />
        </button>
    );
}

// Componente para los números de página
function PageNumber({ number, isActive, onClick }) {
    return (
        <button
            onClick={() => onClick(number)}
            className={`flex items-center justify-center w-6 h-6 rounded-full shadow-sm 
                ${isActive ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'}
                hover:bg-indigo-400 hover:text-white transition-colors`}
            aria-current={isActive ? "page" : undefined}
        >
            {number}
        </button>
    );
}

function Pagination({ currentPage, totalPages, onPrevious, onNext, onPageClick }) {
    // Generar una lista de números de página
    const renderPageNumbers = () => {
        const pageNumbers = [];

        // Lógica para manejar demasiadas páginas (por ejemplo, mostrar solo algunas)
        // Aquí mostramos todas las páginas si son menos de 7, de lo contrario, usamos puntos suspensivos
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(
                    <PageNumber
                        key={i}
                        number={i}
                        isActive={i === currentPage}
                        onClick={onPageClick}
                    />
                );
            }
        } else {
            // Mostrar las primeras 2 páginas, puntos suspensivos, la página actual y las últimas 2
            pageNumbers.push(
                <PageNumber
                    key={1}
                    number={1}
                    isActive={1 === currentPage}
                    onClick={onPageClick}
                />
            );
            pageNumbers.push(
                <PageNumber
                    key={2}
                    number={2}
                    isActive={2 === currentPage}
                    onClick={onPageClick}
                />
            );
            if (currentPage > 4) {
                pageNumbers.push(<span key="start-ellipsis">...</span>);
            }
            const startPage = Math.max(3, currentPage - 1);
            const endPage = Math.min(totalPages - 2, currentPage + 1);
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(
                    <PageNumber
                        key={i}
                        number={i}
                        isActive={i === currentPage}
                        onClick={onPageClick}
                    />
                );
            }
            if (currentPage < totalPages - 3) {
                pageNumbers.push(<span key="end-ellipsis">...</span>);
            }
            pageNumbers.push(
                <PageNumber
                    key={totalPages - 1}
                    number={totalPages - 1}
                    isActive={(totalPages - 1) === currentPage}
                    onClick={onPageClick}
                />
            );
            pageNumbers.push(
                <PageNumber
                    key={totalPages}
                    number={totalPages}
                    isActive={totalPages === currentPage}
                    onClick={onPageClick}
                />
            );
        }

        return pageNumbers;
    };

    return (
        <nav
            className="flex gap-4 items-center justify-center mt-12 ml-3 max-w-full text-sm tracking-tight whitespace-nowrap text-zinc-700 max-md:mt-10"
            aria-label="Pagination"
            style={{ fontFamily: 'Work Sans, sans-serif', letterSpacing: '-2%' }}
        >
            {/* Indicador de página actual */}
            <div className="text-center font-medium">
                Página {currentPage} de {totalPages}
            </div>

            {/* Botones de navegación */}
            <div className="flex gap-4 items-center">
                <PageButton
                    ariaLabel="Previous page"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/6597016ce74407965e5942192543dc190a31a922d35fd2c6fdbe7a605429c402?apiKey=c8e063ba4e294c0496fff8126c800e5e&"
                    altText="Previous page icon"
                    onClick={onPrevious}
                    disabled={currentPage === 1}
                />

                {/* Números de página */}
                {renderPageNumbers()}

                <PageButton
                    ariaLabel="Next page"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/dd79cff359ae0550422ce2addded51890df055927929c99a9887902f8948ecd9?apiKey=c8e063ba4e294c0496fff8126c800e5e&"
                    altText="Next page icon"
                    onClick={onNext}
                    disabled={currentPage === totalPages}
                />
            </div>
        </nav>
    );
}

export default Pagination;
