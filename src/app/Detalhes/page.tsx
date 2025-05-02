"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TechnicalSpecsPage() {
  const [technicalSpecs, setTechnicalSpecs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [groupedSpecs, setGroupedSpecs] = useState({})

  // Fetching data from the API
  useEffect(() => {
    const fetchTechnicalSpecs = async () => {
      try {
        const response = await fetch('/api/technical_specs')
        const data = await response.json()
        setTechnicalSpecs(data)
        
        // Agrupar especificações por categoria
        const grouped = data.reduce((acc, spec) => {
          if (!acc[spec.product_group]) {
            acc[spec.product_group] = []
          }
          acc[spec.product_group].push(spec)
          return acc
        }, {})
        
        setGroupedSpecs(grouped)
      } catch (error) {
        console.error("Erro ao carregar especificações técnicas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTechnicalSpecs()
  }, [])

  // Obter todas as categorias únicas
  const categories = Object.keys(groupedSpecs)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Cabeçalho */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">Especificações Técnicas</h1>
              <p className="text-blue-600">Detalhes técnicos completos de nossos produtos</p>
            </div>

            {/* Exibição dos resultados */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2 text-blue-700">Carregando especificações...</p>
                </div>
              ) : technicalSpecs.length > 0 ? (
                <>
                  {/* Tabs para filtrar por categoria */}
                  <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                    <div className="border-b border-blue-100 overflow-x-auto pb-1">
                      <TabsList className="bg-transparent h-auto p-0 mb-[-1px] flex flex-nowrap min-w-full w-max">
                        <TabsTrigger
                          value="all"
                          className="text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                        >
                          Todas
                        </TabsTrigger>
                        {categories.map((category) => (
                          <TabsTrigger
                            key={category}
                            value={category}
                            className="text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                          >
                            {category}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    {/* Conteúdo para "Todas" */}
                    <TabsContent value="all" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {technicalSpecs.map((spec) => (
                          <SpecCard key={spec.id} spec={spec} />
                        ))}
                      </div>
                    </TabsContent>

                    {/* Conteúdo para cada categoria */}
                    {categories.map((category) => (
                      <TabsContent key={category} value={category} className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupedSpecs[category].map((spec) => (
                            <SpecCard key={spec.id} spec={spec} />
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-blue-200">
                  <p className="text-blue-600">Nenhuma especificação técnica disponível.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para exibir um card de especificação
function SpecCard({ spec }) {
  return (
    <Card className="overflow-hidden border-blue-200 hover:shadow-md transition-shadow">
      <CardHeader className="bg-blue-600 p-4">
        <CardTitle className="text-white text-lg">{spec.product_group}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {spec.product_name && (
            <div>
              <h4 className="text-sm font-medium text-blue-700">Produto:</h4>
              <p className="font-semibold">{spec.product_name}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-blue-700">Detalhes Técnicos:</h4>
            <p className="text-gray-700 whitespace-pre-line">{spec.technical_details}</p>
          </div>

          {spec.additional_info && (
            <div>
              <h4 className="text-sm font-medium text-blue-700">Informações Adicionais:</h4>
              <p className="text-gray-700">{spec.additional_info}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
