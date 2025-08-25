class RespostaPadrao:
    def __init__(self, status_http: int, mensagem: str, dados=None, id_erro=None):
        self.status_http = status_http  
        self.mensagem = mensagem
        self.dados = dados
        self.id_erro = id_erro

    def to_dict(self):
        resposta = {
            "status": self.status_http,
            "mensagem": self.mensagem
        }
        if self.dados is not None:
            resposta["dados"] = self.dados
        if self.id_erro is not None:
            resposta["id_erro"] = self.id_erro
        return resposta
    
    #"CAMPOS_OBRIGATORIOS": "USR001",
    #"EMAIL_DUPLICADO": "USR002",
    #"ERRO_DESCONHECIDO": "USR999"
    #DB001 : Falha ao conectar com o banco de dados
    #"USUARIO_NAO_ENCONTRADO": "AUTH001",
    #"SENHA_INCORRETA": "AUTH002",
    #"ERRO_LOGIN": "AUTH999"