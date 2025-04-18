import { useState } from "react";
import api from "../lib/axiosConfig";
import { Case } from "../types/Case";
import { ApiError } from "../types/Error";

interface Report {
  _id: string;
  caseId: string;
  titulo?: string;
  descricao?: string;
  objetoPericia?: string;
  analiseTecnica?: string;
  metodoUtilizado?: string;
  destinatario?: string;
  materiaisUtilizados?: string;
  examesRealizados?: string;
  consideracoesTecnicoPericiais?: string;
  conclusaoTecnica?: string;
  evidencias?: string;
}

interface ReportData {
  caseId: string;
  titulo?: string;
  descricao?: string;
  objetoPericia?: string;
  analiseTecnica?: string;
  metodoUtilizado?: string;
  destinatario?: string;
  materiaisUtilizados?: string;
  examesRealizados?: string;
  consideracoesTecnicoPericiais?: string;
  conclusaoTecnica?: string;
  evidencias?: string;
}

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null | undefined>(null);

  // Busca os casos disponíveis
  const fetchCases = async (): Promise<Case[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: Case[] }>("/cases");
      return response.data.data;
    } catch (err) {
      const errorTyped = err as ApiError;
      const errorMessage = errorTyped.response?.data?.msg || "Erro ao carregar os casos.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Busca os relatórios
  const fetchReports = async (): Promise<Report[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{ data: Report[] }>("/report");
      return response.data.data;
    } catch (err) {
      const errorTyped = err as ApiError;
      const errorMessage = errorTyped.response?.data?.msg || "Erro ao carregar os relatórios.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cadastra um novo relatório
  const createReport = async (data: ReportData): Promise<Blob> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post("/report", data, {
        responseType: "blob",
      });
      return response.data;
    } catch (err) {
      const errorTyped = err as ApiError;
      const errorMessage = errorTyped.response?.data?.msg || "Erro ao criar o relatório.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Atualiza um relatório existente
  const updateReport = async (reportId: string, data: ReportData): Promise<Report> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put<{ data: Report }>(`/report/${reportId}`, data);
      return response.data.data;
    } catch (err) {
      const errorTyped = err as ApiError;
      const errorMessage = errorTyped.response?.data?.msg || "Erro ao atualizar o relatório.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Exclui um relatório
  const deleteReport = async (reportId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/report/${reportId}`);
    } catch (err) {
      const errorTyped = err as ApiError;
      const errorMessage = errorTyped.response?.data?.msg || "Erro ao excluir o relatório.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchCases,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    loading,
    error,
  };
};