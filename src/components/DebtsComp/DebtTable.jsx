﻿import React, { useState, useEffect } from "react";
import {
    FaEye,
    FaChevronLeft,
    FaChevronRight,
    FaTrash,
    FaPlus,
    FaInfoCircle,
} from "react-icons/fa";
import dayjs from "dayjs";
import AddAccountingHonorary from "./AddAccountingHonorary";
import ConfirmationModal from "./ConfirmationModal";
import Spinner from "./Spinner";
import Modal from "./Modal";
import HonoraryList from "./HonoraryList";
import DebtList from "./DebtList";

const DebtTable = ({ debts = [], honorariosContables = [], clienteId }) => {
    const [currentPageDebts, setCurrentPageDebts] = useState(1);
    const [currentPageHonorarios, setCurrentPageHonorarios] = useState(1);
    const [honorariosData, setHonorariosData] = useState([]);
    const [loadingHonorarios, setLoadingHonorarios] = useState(false);
    const [loadingDebts, setLoadingDebts] = useState(false); // Para controlar el estado de carga de las deudas

    const [selectedDebtId, setSelectedDebtId] = useState(null);
    const [detailedDebt, setDetailedDebt] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedHonorario, setSelectedHonorario] = useState(null);
    const [selectedHonorarioDetails, setSelectedHonorarioDetails] = useState(null);
    const [montoPago, setMontoPago] = useState("");
    const [comprobante, setComprobante] = useState(null);
    const [comprobanteUrl, setComprobanteUrl] = useState(null);
    const [fechaPagoReal, setFechaPagoReal] = useState("");
    const [metodoPago, setMetodoPago] = useState("");


    const [showDeleteDebtConfirmation, setShowDeleteDebtConfirmation] = useState(false);
    const [debtToDelete, setDebtToDelete] = useState(null);

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [honorarioToDelete, setHonorarioToDelete] = useState(null);
    const [showEditHonorarioModal, setShowEditHonorarioModal] = useState(false);
    const [nuevoMontoMensual, setNuevoMontoMensual] = useState("");

    const [showAddHonorarioModal, setShowAddHonorarioModal] = useState(false);

    // Fetch Honorarios
    const fetchHonorarios = async () => {
        setLoadingHonorarios(true);
        try {
            const response = await fetch(`https://backend.cobros.myccontadores.cl/api/honorarios/cliente/${clienteId}`);
            if (!response.ok) {
                throw new Error("Error al obtener los honorarios contables.");
            }
            const data = await response.json();
            setHonorariosData(data);
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoadingHonorarios(false);
        }
    };

    // Fetch Deudas
    const fetchDebts = async () => {
        setLoadingDebts(true);  // Inicia la carga de las deudas
        try {
            const response = await fetch(`https://backend.cobros.myccontadores.cl/api/deudas/cliente/${clienteId}`);
            if (!response.ok) {
                throw new Error("Error al obtener las deudas.");
            }
            // No es necesario hacer setDebts si las deudas se pasan como prop
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoadingDebts(false);  // Finaliza la carga
        }
    };

    useEffect(() => {
        fetchHonorarios();
        fetchDebts();
    }, [currentPageHonorarios, currentPageDebts]);

    const paginatedData = (data, currentPage) =>
        data.slice((currentPage - 1) * 10, currentPage * 10);

    const handleViewDetails = async (debt) => {
        setSelectedDebtId(debt.deudaId);
        setLoadingDetails(true);
        try {
            const response = await fetch(`https://backend.cobros.myccontadores.cl/api/deudas/${debt.deudaId}/detalle`);
            if (!response.ok) {
                throw new Error("Error al obtener detalles de la deuda");
            }
            const data = await response.json();
            setDetailedDebt(data);
        } catch (error) {
            console.error("No se pudieron cargar los detalles de la deuda:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeDetails = () => {
        setDetailedDebt(null);
        setSelectedDebtId(null);
    };

    const handleDeleteDebt = (debt) => {
        setDebtToDelete(debt);
        setShowDeleteDebtConfirmation(true);
    };

    const confirmDeleteDebt = async () => {
        try {
            const response = await fetch(`https://backend.cobros.myccontadores.cl/api/deudas/${debtToDelete.deudaId}`, { method: "DELETE" });
            if (!response.ok) {
                throw new Error("Error al eliminar la deuda.");
            }
            setShowDeleteDebtConfirmation(false);
            setDebtToDelete(null);
        } catch (err) {
            console.error(err.message);
            setShowDeleteDebtConfirmation(false);
        }
    };

    const handleDeleteHonorario = (honorario) => {
        setHonorarioToDelete(honorario);
        setShowDeleteConfirmation(true);
    };

    const confirmDeleteHonorario = async () => {
        try {
            const response = await fetch(`https://backend.cobros.myccontadores.cl/api/honorarios/${honorarioToDelete.honorarioId}`, { method: "DELETE" });
            if (!response.ok) {
                throw new Error("Error al eliminar el honorario.");
            }
            fetchHonorarios();
            setShowDeleteConfirmation(false);
            setHonorarioToDelete(null);
        } catch (err) {
            console.error(err.message);
            setShowDeleteConfirmation(false);
        }
    };

    const handleAddHonorario = () => {
        setShowAddHonorarioModal(true);
    };

    const handleViewHonorarioDetails = async (honorarioId) => {
        try {
            const response = await fetch(`https://backend.cobros.myccontadores.cl/api/honorarios/${honorarioId}/detalle`);
            if (!response.ok) {
                throw new Error("Error al cargar los detalles del honorario.");
            }
            const data = await response.json();
            setSelectedHonorarioDetails(data); // Actualiza el estado con los detalles del honorario
        } catch (err) {
            console.error("Error al cargar los detalles:", err);
        }
    };

    const handleRegisterPayment = async (e, honorarioId, mes) => {
        if (e && e.preventDefault) e.preventDefault(); // Solo llamar preventDefault si es un evento

        if (!honorarioId || !mes || !montoPago || !comprobante || !fechaPagoReal || !metodoPago) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const formData = new FormData();
        formData.append("mes", mes);
        formData.append("montoPago", montoPago);
        formData.append("comprobante", comprobante);
        formData.append("fechaPagoReal", fechaPagoReal);
        formData.append("metodoPago", metodoPago);

        try {
            const response = await fetch(
                `https://backend.cobros.myccontadores.cl/api/honorarios/${honorarioId}/pagos`,
                { method: "POST", body: formData }
            );

            if (!response.ok) throw new Error("Error al registrar el pago.");

            alert("Pago registrado exitosamente.");
            fetchHonorarios(); // Refrescar la lista
        } catch (err) {
            console.error("Error al registrar el pago:", err);
            alert("No se pudo registrar el pago.");
        }
    };


    const handleEditHonorario = async (honorarioId, mes, nuevoMonto) => {
        try {
            const response = await fetch(`https://backend.cobros.myccontadores.cl/api/honorarios/${honorarioId}/mes/${mes}?nuevoMontoMensual=${nuevoMonto}`, {
                method: "PUT",
            });
            if (!response.ok) {
                throw new Error("Error al editar el honorario.");
            }
            alert("Honorario actualizado con éxito.");
            setShowEditHonorarioModal(false);
            fetchHonorarios(); // Refresca los honorarios después de la edición
        } catch (err) {
            console.error("Error al editar el honorario:", err);
            alert("No se pudo editar el honorario.");
            setShowEditHonorarioModal(false);
        }
    };

    const openPaymentModal = (honorarioId, mes) => {
        setSelectedHonorario({ honorarioId, mes });
        setShowPaymentModal(true);
    };

    const submitPayment = async () => {
        if (!selectedHonorario || !montoPago || !fechaPagoReal || !metodoPago || !comprobante) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Asegúrate de que el formato de la fecha sea correcto
        const fechaPagoRealFormatted = dayjs(fechaPagoReal).format("YYYY-MM-DD");

        const metodoPagoValid = metodoPago === "Efectivo" ? "EFECTIVO" : metodoPago === "Transferencia" ? "TRANSFERENCIA" : "TARJETA";

        const formData = new FormData();
        formData.append("mes", selectedHonorario.mes);
        formData.append("montoPago", montoPago);
        formData.append("comprobante", comprobante);
        formData.append("fechaPagoReal", fechaPagoRealFormatted);
        formData.append("metodoPago", metodoPagoValid);

        try {
            const response = await fetch(
                `https://backend.cobros.myccontadores.cl/api/honorarios/${selectedHonorario.honorarioId}/pagos`,
                { method: "POST", body: formData }
            );

            if (!response.ok) {
                const errorData = await response.json(); // Obtener los detalles de la respuesta del error
                throw new Error(errorData.error || "Error al registrar el pago.");
            }

            alert("Pago registrado exitosamente.");
            setShowPaymentModal(false);
            fetchHonorarios(); // Refrescar la lista
        } catch (err) {
            console.error("Error al registrar el pago:", err);
            alert("No se pudo registrar el pago. Detalle del error: " + err.message);
        }
    };


    return (
        <div>

            <div>
                <h3>Deudas Normales</h3>
                {loadingDebts ? (
                    <div className="flex justify-center items-center">
                        <Spinner />
                    </div>
                ) : (
                    debts.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-300 py-4">
                            <h4>No hay deudas disponibles</h4>
                            <p>Por favor, agrega deudas o revisa más tarde.</p>
                        </div>
                    ) : (
                        <DebtList
                            debts={debts}
                            currentPage={currentPageDebts}
                            onPageChange={setCurrentPageDebts}
                            handleViewDetails={handleViewDetails}
                            handleDeleteDebt={handleDeleteDebt}
                        />
                    )
                )}
            </div>

            <div>
                {loadingHonorarios ? (
                    <div className="flex justify-center items-center">
                        <Spinner />
                    </div>
                ) : (
                    honorariosData.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-300 py-4">
                            <h4>No hay honorarios disponibles</h4>
                            <p>Por favor, agrega honorarios o revisa más tarde.</p>
                        </div>
                    ) : (
                        <HonoraryList
                            honorariosContables={honorariosData}
                            currentPage={currentPageHonorarios}
                            onPageChange={setCurrentPageHonorarios}
                            handleViewHonorarioDetails={handleViewHonorarioDetails}
                            handleDeleteHonorario={handleDeleteHonorario}
                            handleRegisterPayment={handleRegisterPayment}
                            handleEditHonorario={handleEditHonorario}
                            fetchHonorarios={fetchHonorarios}
                            openPaymentModal={openPaymentModal}
                        />
                    )
                )}
            </div>

            {/* Modales */}
            {detailedDebt && (
                <Modal isOpen={true} onClose={closeDetails}>
                    <div>
                        <h3>Detalles de la Deuda</h3>
                        <p><strong>Tipo de Deuda:</strong> {detailedDebt.tipoDeuda}</p>
                        <p><strong>Monto Total:</strong> {detailedDebt.montoTotal}</p>
                        <p><strong>Estado:</strong> {detailedDebt.estadoDeuda}</p>
                    </div>
                </Modal>
            )}

            {showDeleteDebtConfirmation && (
                <ConfirmationModal
                    isOpen={showDeleteDebtConfirmation}
                    onClose={() => setShowDeleteDebtConfirmation(false)}
                    onConfirm={confirmDeleteDebt}
                    message={`¿Estás seguro de que deseas eliminar esta deuda?`}
                />
            )}

            {/* Modal para Confirmar Eliminación */}
            {showDeleteConfirmation && (
                <Modal isOpen={showDeleteConfirmation} onClose={() => setShowDeleteConfirmation(false)}>
                    <div>
                        <h3>¿Estás seguro de que deseas eliminar este honorario?</h3>
                        <div className="flex justify-between">
                            <button
                                onClick={confirmDeleteHonorario}
                                className="bg-red-500 text-white py-2 px-4 rounded"
                            >
                                Confirmar Eliminación
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirmation(false)}
                                className="bg-gray-300 text-black py-2 px-4 rounded"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal para Editar Honorario */}
            {showEditHonorarioModal && (
                <Modal isOpen={showEditHonorarioModal} onClose={() => setShowEditHonorarioModal(false)}>
                    <div>
                        <h3>Editar Honorario - Mes</h3>
                        <input
                            type="number"
                            value={nuevoMontoMensual}
                            onChange={(e) => setNuevoMontoMensual(e.target.value)}
                            placeholder="Nuevo monto mensual"
                            className="w-full p-2 mt-2 border rounded"
                        />
                        <button
                            onClick={() => handleEditHonorario(selectedHonorario.honorarioId, selectedHonorario.mes, nuevoMontoMensual)}
                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </Modal>
            )}

            {showDeleteConfirmation && (
                <ConfirmationModal
                    isOpen={showDeleteConfirmation}
                    onClose={() => setShowDeleteConfirmation(false)}
                    onConfirm={confirmDeleteHonorario}
                    message={`¿Estás seguro de que deseas eliminar este honorario?`}
                />
            )}

            {showAddHonorarioModal && (
                <Modal isOpen={showAddHonorarioModal} onClose={() => setShowAddHonorarioModal(false)}>
                    <AddAccountingHonorary
                        onSubmit={handleRegisterPayment}
                        clienteId={clienteId}
                        onClose={() => setShowAddHonorarioModal(false)}
                    />
                </Modal>
            )}

            {selectedHonorarioDetails && (
                <Modal isOpen={true} onClose={() => setSelectedHonorarioDetails(null)}>
                    <div>
                        <h3>Detalles del Honorario</h3>
                        <p><strong>Mes:</strong> {selectedHonorarioDetails.mes}</p>
                        <p><strong>Año:</strong> {selectedHonorarioDetails.anio}</p>
                        <p><strong>Monto Mensual:</strong> ${Number(selectedHonorarioDetails.montoMensual).toLocaleString("es-CL")}</p>
                        <p><strong>Estado:</strong> {selectedHonorarioDetails.estado}</p>
                    </div>
                </Modal>
            )}

            {showPaymentModal && (
                <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
                    <div>
                        <h3>Registrar Pago</h3>

                        <label>Monto a pagar:</label>
                        <input
                            type="number"
                            value={montoPago}
                            onChange={(e) => setMontoPago(e.target.value)}
                            className="w-full p-2 mt-2 border rounded"
                        />

                        <label>Fecha de pago:</label>
                        <input
                            type="date"
                            value={fechaPagoReal}
                            onChange={(e) => setFechaPagoReal(e.target.value)}
                            className="w-full p-2 mt-2 border rounded"
                        />

                        <label>Método de pago:</label>
                        <select
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            className="w-full p-2 mt-2 border rounded"
                        >
                            <option value="">Selecciona un método</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Tarjeta">Tarjeta</option>
                        </select>

                        <label>Comprobante:</label>
                        <input
                            type="file"
                            onChange={(e) => setComprobante(e.target.files[0])}
                            className="w-full p-2 mt-2 border rounded"
                        />

                        <button
                            onClick={submitPayment}
                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                        >
                            Registrar Pago
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default DebtTable;