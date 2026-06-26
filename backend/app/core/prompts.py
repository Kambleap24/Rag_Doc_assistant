from langchain.prompts import PromptTemplate

FEW_SHOT_EXAMPLES = """
Example 1:
Context: "The transformer architecture uses self-attention mechanisms to process sequences in parallel."
Question: "How does a transformer process input?"
Answer: "A transformer processes input using self-attention mechanisms that allow it to handle all positions in a sequence simultaneously."

Example 2:
Context: "The model achieved 94.2% accuracy on the GLUE benchmark after fine-tuning for 3 epochs."
Question: "What accuracy did the model achieve?"
Answer: "The model achieved 94.2% accuracy on the GLUE benchmark after fine-tuning for 3 epochs."
"""

RAG_PROMPT_TEMPLATE = PromptTemplate(
    input_variables=["context", "question", "chat_history"],
    partial_variables={"few_shot_examples": FEW_SHOT_EXAMPLES},
    template="""You are a precise document assistant. Answer ONLY based on the provided context.
If the context doesn't contain enough information, say "I don't have enough information in the provided documents to answer this."

{few_shot_examples}

Chat History:
{chat_history}

Retrieved Context:
{context}

Question: {question}

Instructions:
- Think step by step before answering
- Cite specific parts of the context when relevant
- Be concise but complete
- Do NOT hallucinate information not in the context

Answer:""",
)