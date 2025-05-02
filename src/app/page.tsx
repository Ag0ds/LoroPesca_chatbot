"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Carregar todos os produtos ao iniciar
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        const data = await response.json()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Função de busca
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    const filtered = products.filter(
      (product) =>
        product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    setFilteredProducts(filtered)
  }

  // Função para lidar com a tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 dark:text-blue-300 mb-2">Buscar Produtos</h1>
            <p className="text-blue-600 dark:text-blue-400">Encontre os produtos que você precisa em nosso catálogo</p>
          </div>

          {/* Formulário de busca */}
          <div className="flex flex-col md:flex-row gap-2 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={18} />
              <Input
                className="pl-10 bg-white border-blue-200 focus-visible:ring-blue-500 text-blue-700"
                type="text"
                placeholder="Digite o nome do produto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          {/* Exibição dos resultados */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-2 text-blue-700">Carregando produtos...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden border-blue-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="bg-blue-600 p-3">
                        <h3 className="font-semibold text-white truncate">{product.product_name}</h3>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700 dark:text-blue-300">Código:</span>
                        <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                          {product.product_code}
                        </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">Preço:</span>
                          <span className="font-bold text-blue-800">R${product.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">Disponibilidade:</span>
                          <Badge
                            className={
                              product.availability.toLowerCase() === "disponivel"
                                ? "bg-green-500 hover:bg-green-600"
                                : product.availability.toLowerCase() === "indisponivel"
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-gray-500 hover:bg-gray-600"
                            }
                          >
                            {product.availability}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-blue-200">
                <p className="text-blue-600">
                  {searchQuery.trim() ? "Nenhum produto encontrado." : "Nenhum produto disponível."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
