import google.generativeai as genai

genai.configure(api_key="AQ.Ab8RN6IgF8QncctG_WOVj8aFfe1Iz6a_0ebA0SSa5JI6zEeZHQ")

for m in genai.list_models():
    if "embed" in m.name:
        print(m.name)