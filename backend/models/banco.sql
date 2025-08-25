
CREATE TABLE filmes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR (100) NOT NULL,
    genero VARCHAR(100) NOT NULL,
    ano INT NOT NULL,
    imagem_url VARCHAR (255),
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
); 

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR (100) NOT NULL,
    senha VARCHAR (100) NOT NULL
    data_nascimento DATE NOT NULL
);

