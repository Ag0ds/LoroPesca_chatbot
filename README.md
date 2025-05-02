# 💬 Mercado Virtual - Loro Pesca

🎣 Sua loja virtual de equipamentos de pesca.

### O que este sistema é capaz de fazer?

Ele apresenta um catálogo completo da loja, além de uma aba com detalhes técnicos de cada produto. O destaque, no entanto, são os chats disponíveis: um para conversar com nossa IA, que conhece todos os nossos produtos, e outro para atendimento direto com um de nossos especialistas virtuais.

---

## 📐 Arquitetura

### Como nosso sistema funciona?

- **Next.js**: Interface moderna em React com suporte a server-side rendering
- **Backend**:
  - **PostgreSQL**: Armazena produtos e catálogos
  - **Supabase**: Gerencia mensagens em tempo real entre funcionários e clientes
  - **API Gemini**: Inteligência artificial para recomendações automáticas
- **Frontend**:
  - Interface responsiva e agradável com **React + Tailwind CSS**
  - Navegação intuitiva para uma melhor experiência do usuário
- **Comunicação**:
  - Mensagens armazenadas na tabela `messages`
  - Realtime via Supabase: `.channel().on('postgres_changes')`
  - Alinhamento condicional baseado no campo `sender` (cliente ou atendente)

---

## ⚙️ Como rodar o projeto

### 1. Clone o repositório

  - bash
```git clone https://github.com/seu-usuario/chat-supabase-nextjs.git```
```cd chat-supabase-nextjs```

2. **Instale as dependências**
   
    - bash
  ```npm install```

3. **Crie o arquivo .env.local**
<pre>DATABASE_URL="postgresql://postgres:teste@localhost:5432/loro?schema=public"
GEMINI_API_KEY = AIzaSyBJJ_ra1c2zRaLs5TsTIyYPmcZ-WLPohTo
GEMINI_API_KEY = AIzaSyBJJ_ra1c2zRaLs5TsTIyYPmcZ-WLPohTo
NEXT_PUBLIC_SUPABASE_URL=https://qpopwhpatlqgifyzmrhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwb3B3aHBhdGxxZ2lmeXptcmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxODI1OTcsImV4cCI6MjA2MTc1ODU5N30.V4ucQ4D0OchVDccAwsKmPbSHT08u9hBy_zKJTKjwXZw </pre>

4. **Configure o Banco de dados**
  - Produtos (Postgresql)
  <pre>CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  product_code TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  availability_text TEXT
);
 </pre>
  - Especificações (Postgresql)
<pre>CREATE TABLE technical_specs (
  id SERIAL PRIMARY KEY,
  product_group TEXT NOT NULL,
  technical_details TEXT NOT NULL
);</pre>
- Mensagens (Supabase)
<pre>create table messages (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  sender text,
  created_at timestamp with time zone default now()
);
</pre>

5. **Execute a aplicação**
    - bash
  ```npm run dev```

_Observação:_
  - Não consegui testar no *docker* pra ter certeza de funcionar, por precaução ao final do README.MD deixarei demonstração das funcionalidades.


![Funcionamento do site](https://github.com/user-attachments/assets/ea8b2c77-d3c3-44f7-bbab-585ac7a35807)


![Funcionamento do chatbot](https://github.com/user-attachments/assets/b01e12e0-2e21-4866-a691-e646a143a08b)


Vídeo Apresentação do projeto -> https://drive.google.com/uc?id=1cjdz2Hf9M2rxSHcayqYo7_sw4VHYzy1s&export=download
















