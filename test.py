import os

locations = ["app", "src"]

with open("out.txt", "w", encoding="utf-8") as output_file:
    for app_dir in locations:
        if os.path.exists(app_dir) and os.path.isdir(app_dir):
            for root, dirs, files in os.walk(app_dir):
                for file in files:
                    if file.endswith(".jsx") or file.endswith(".js"):
                        filepath = os.path.join(root, file)
                        output_file.write(f"===== {filepath} =====\n")
                        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                            output_file.write(f.read())
                            output_file.write("\n\n")
    else:
        output_file.write("App directory not found!\n")