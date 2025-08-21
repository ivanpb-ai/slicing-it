import json
from playwright.sync_api import sync_playwright

# Load the graph data from the TypeScript file
with open("src/data/exampleGraph.ts", "r") as f:
    content = f.read()
    # Strip the TypeScript export to get the raw JSON
    json_str = content.replace("export const EXAMPLE_GRAPH = ", "").strip().rstrip(";")
    graph_data = json.loads(json_str)

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173/")

    # Wait for the page to be fully loaded
    page.wait_for_load_state("networkidle")

    # Load the graph data using the exposed testing function
    page.evaluate("window.loadGraphDataForTesting", graph_data)

    # Wait for the nodes to be rendered
    page.wait_for_selector('.react-flow__node')

    # Give the layout some time to settle
    page.wait_for_timeout(2000)

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
