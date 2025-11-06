"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DocumentCard from "@/components/document-card"
import useSWR from "swr"
import { useState, useEffect } from "react"
import Link from "next/link"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

// Documentos de ejemplo (placeholders)
const SAMPLE_DOCUMENTS = [
  {
    id: "sample-1",
    title: "Licencia de Conducir",
    document_type: "driver_license",
    expiration_date: "2025-12-15",
    renewal_url: "https://www.argentina.gob.ar/transporte",
    user_id: "placeholder",
  },
  {
    id: "sample-2",
    title: "DNI",
    document_type: "national_id",
    expiration_date: "2026-06-20",
    renewal_url: "https://www.argentina.gob.ar/interior/renaper",
    user_id: "placeholder",
  },
  {
    id: "sample-3",
    title: "Pasaporte",
    document_type: "passport",
    expiration_date: "2025-08-10",
    renewal_url: "https://www.argentina.gob.ar/interior/migraciones",
    user_id: "placeholder",
  },
]

export default function MisDocumentosPage() {
  const { data: documents, mutate } = useSWR("/api/documents", fetcher)
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "valid" | "expiring" | "expired">("all")

  useEffect(() => {
    if (documents !== undefined) {
      setIsLoading(false)
    }
  }, [documents])

  const displayDocuments = documents && documents.length > 0 ? documents : SAMPLE_DOCUMENTS

  const getDocumentStatus = (expirationDate: string) => {
    const expDate = new Date(expirationDate)
    const today = new Date()
    const daysUntilExpiry = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return "expired"
    if (daysUntilExpiry <= 30) return "expiring"
    return "valid"
  }

  const filteredDocuments = displayDocuments.filter((doc: any) => {
    if (filterStatus === "all") return true
    return getDocumentStatus(doc.expiration_date) === filterStatus
  })

  const stats = {
    total: displayDocuments.length,
    valid: displayDocuments.filter((d: any) => getDocumentStatus(d.expiration_date) === "valid").length,
    expiring: displayDocuments.filter((d: any) => getDocumentStatus(d.expiration_date) === "expiring").length,
    expired: displayDocuments.filter((d: any) => getDocumentStatus(d.expiration_date) === "expired").length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Documentos</h1>
          <p className="text-muted-foreground mt-1">Gestiona y controla la vigencia de tus documentos</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground mt-1">Total de documentos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.valid}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Vigentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.expiring}</p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">Por vencer</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.expired}</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">Vencidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="valid">Vigentes</TabsTrigger>
          <TabsTrigger value="expiring">Por vencer</TabsTrigger>
          <TabsTrigger value="expired">Vencidos</TabsTrigger>
        </TabsList>

        {/* Contenido de tabs */}
        <TabsContent value={filterStatus} className="space-y-4 mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">Cargando documentos...</p>
              </CardContent>
            </Card>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc: any) => (
                <DocumentCard key={doc.id} document={doc} onUpdate={() => mutate()} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">
                  {filterStatus === "all"
                    ? "No hay documentos. ¡Comienza agregando uno!"
                    : `No hay documentos ${filterStatus === "valid" ? "vigentes" : filterStatus === "expiring" ? "por vencer" : "vencidos"}.`}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Información de ayuda */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">💡 Consejo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200">
          <p>
            Mantén tus documentos siempre vigentes. Recibirás notificaciones automáticas cuando estén próximos a vencer
            para que puedas renovarlos a tiempo.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
