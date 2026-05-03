import os
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import tempfile

# Store chroma db in python_Files directory
CHROMA_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chromadb_storage")

embeddings = OpenAIEmbeddings()

def get_vector_store():
    # Chroma creates the directory if it doesn't exist
    return Chroma(persist_directory=CHROMA_DB_DIR, embedding_function=embeddings)

def delete_workspace_documents(workspace_id, doc_type=None):
    """
    Delete documents from ChromaDB for a specific workspace and optionally a specific type.
    """
    vectorstore = get_vector_store()
    
    # Construct Chroma 'where' filter
    where_filter = {"workspace_id": workspace_id}
    if doc_type:
        where_filter["type"] = doc_type
    
    try:
        # Access the underlying collection directly for more reliable deletion
        vectorstore._collection.delete(where=where_filter)
        print(f"✅ Deleted documents from Chroma for workspace {workspace_id} with filter {where_filter}")
    except Exception as e:
        print(f"⚠️ Error deleting documents from Chroma: {e}")
        # Fallback to langchain-chroma's delete if direct access fails (though it might still fail)
        try:
            vectorstore.delete(where=where_filter)
        except:
            pass

def ingest_pdf_to_rag(file_path, metadata=None):
    if metadata is None:
        metadata = {}
        
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    
    # Inject metadata
    for doc in docs:
        doc.metadata.update(metadata)
        
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    
    vectorstore = get_vector_store()
    vectorstore.add_documents(documents=splits)
    
def retrieve_relevant_docs(query, workspace_id=None, top_k=5):
    vectorstore = get_vector_store()
    # If workspace_id is provided, you might want to filter by it
    # For now, simple similarity search
    
    filter_dict = {}
    if workspace_id:
        filter_dict["workspace_id"] = workspace_id
        
    # Chroma vectorstore search
    if filter_dict:
        docs = vectorstore.similarity_search(query, k=top_k, filter=filter_dict)
    else:
        docs = vectorstore.similarity_search(query, k=top_k)
        
    return docs
