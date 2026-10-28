from typing import Any


def assign_positions(
    new_nodes: list[Any],
    existing_nodes: list[Any],
    base_x: float = 0,
    base_y: float = 0,
    spacing_x: float = 250,
    spacing_y: float = 150,
) -> None:
    occupied = set()
    for node in existing_nodes:
        position = (node.data or {}).get("position")
        if position and isinstance(position, dict):
            occupied.add((int(position.get("x", 0) // spacing_x), int(position.get("y", 0) // spacing_y)))

    center_x, center_y = int(base_x // spacing_x), int(base_y // spacing_y)
    for node in new_nodes:
        radius = 0
        placed = False
        while not placed:
            for dx in range(-radius, radius + 1):
                for dy in range(-radius, radius + 1):
                    if radius == 0 or abs(dx) == radius or abs(dy) == radius:
                        cell = (center_x + dx, center_y + dy)
                        if cell not in occupied:
                            occupied.add(cell)
                            data = dict(node.data or {})
                            data["position"] = {"x": cell[0] * spacing_x, "y": cell[1] * spacing_y}
                            node.data = data
                            placed = True
                            break
                if placed:
                    break
            radius += 1
