import sys
import json
from playwright.sync_api import sync_playwright

def run(playwright, url):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # The example graph data
    graph_data_str = """
    {
        "nodes": [
            { "id": "network-1", "type": "customNode", "position": { "x": 0, "y": 0 }, "data": { "type": "network", "label": "NETWORK" } },
            { "id": "cell-area-1", "type": "customNode", "position": { "x": 0, "y": 0 }, "data": { "type": "cell-area", "label": "CELL-AREA 1", "parentId": "network-1" } },
            { "id": "cell-area-2", "type": "customNode", "position": { "x": 0, "y": 0 }, "data": { "type": "cell-area", "label": "CELL-AREA 2", "parentId": "network-1" } },
            { "id": "rrp-1", "type": "customNode", "position": { "x": 0, "y": 0 }, "data": { "type": "rrp", "label": "RRP", "parentId": "cell-area-1" } },
            { "id": "rrpmember-1", "type": "customNode", "position": { "x": 0, "y": 0 }, "data": { "type": "rrpmember", "label": "MEMBER 1", "parentId": "rrp-1" } },
            { "id": "rrpmember-2", "type": "customNode", "position": { "x": 0, "y": 0 }, "data": { "type": "rrpmember", "label": "MEMBER 2", "parentId": "rrp-1" } },
            { "id": "s-nssai-1", "type": "customNode", "position": { "x": 0, "y": 0 }, "data": { "type": "s-nssai", "label": "S-NSSAI 1", "parentId": "rrpmember-1" } },
            { "id": "s-nssai-2", "type": "customNode", "position": { "x": 0, "y": 0 }, "data": { "type": "s-nssai", "label": "S-NSSAI 2", "parentId": "rrpmember-2" } },
            { "id": "dnn-1", "type": "customNode", "position": { "x": 0, "y": 0 }, "data": { "type": "dnn", "label": "DNN", "parentId": "s-nssai-1" } },
            { "id": "fiveqi-1", "type": "customNode", "position": { "x": 0, "y": 0 }, "data": { "type": "fiveqi", "label": "5QI", "parentId": "dnn-1" } }
        ],
        "edges": [
            { "id": "e-n1-ca1", "source": "network-1", "target": "cell-area-1" },
            { "id": "e-n1-ca2", "source": "network-1", "target": "cell-area-2" },
            { "id": "e-ca1-rrp1", "source": "cell-area-1", "target": "rrp-1" },
            { "id": "e-rrp1-m1", "source": "rrp-1", "target": "rrpmember-1" },
            { "id": "e-rrp1-m2", "source": "rrp-1", "target": "rrpmember-2" },
            { "id": "e-m1-s1", "source": "rrpmember-1", "target": "s-nssai-1" },
            { "id": "e-m2-s2", "source": "rrpmember-2", "target": "s-nssai-2" },
            { "id": "e-s1-d1", "source": "s-nssai-1", "target": "dnn-1" },
            { "id": "e-d1-f1", "source": "dnn-1", "target": "fiveqi-1" }
        ]
    }
    """
    graph_data = json.loads(graph_data_str)

    page.goto(url)

    # Wait for the page to be fully loaded and the testing function to be available
    page.wait_for_function("window.loadGraphDataForTesting")

    # Load the graph data using the exposed function
    page.evaluate("window.loadGraphDataForTesting", graph_data)

    # Wait for the nodes to be rendered
    page.wait_for_selector('.react-flow__node')

    # Give the layout some time to settle
    page.wait_for_timeout(2000)

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python verify_layout.py <url>")
        sys.exit(1)
    url = sys.argv[1]
    with sync_playwright() as playwright:
        run(playwright, url)
