import mysql.connector
 
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="123456",
    database="catalago"
)

cursor = conn.cursor()

def add_filme(titulo, genero, ano):
    sql = 'INSERT INTO filmes (titulo, genero, ano) VALUES (%s, %s, %s)'
    valores = (titulo, genero, ano)
    cursor.execute(sql, valores)
    conn.commit()
    print(f'🎬 Filme "{titulo}" adicionado!')

def listar_filmes():
    cursor.execute('SELECT * FROM filmes')
    resultados = cursor.fetchall()
    for filme in resultados:
        print(f'{filme[0]} - {filme[1]} ({filme[2]}, {filme[3]})')


add_filme("Matrix", "Ficção Científica", 1999)
listar_filmes()

conn.close()