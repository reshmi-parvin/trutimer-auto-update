# from pynput import keyboard, mouse

# # Callback function for keyboard events
# def on_key_press(key):
#     print(f'Key pressed: {key}')

# # Callback function for mouse events
# def on_mouse_click(x, y, button, pressed):
#     action = 'pressed' if pressed else 'released'
#     print(f'MouseClick {action} at ({x}, {y}) with button {button}')

# # Callback function for mouse events
# # def on_mouse_move(x, y):
# #     print(f'MouseMove  at ({x}, {y})')

# # Start listening for keyboard events
# keyboard_listener = keyboard.Listener(on_press=on_key_press)
# keyboard_listener.start()

# # Start listening for mouse events
# # mouse_listener = mouse.Listener(on_move=on_mouse_move,on_click=on_mouse_click)
# mouse_listener = mouse.Listener(on_click=on_mouse_click)
# mouse_listener.start()

# # Keep the script running
# keyboard_listener.join()
# mouse_listener.join()


from pynput.mouse import Listener as MouseListener, Button
from pynput.keyboard import Listener as KeyboardListener, Key
import json

mouse_data = {
    'left_click': 0,
    'right_click': 0,
    'move': 0,
    'scroll': 0
}

keyboard_data = {}

tracking = True

def on_move(x, y):
    if tracking:
        mouse_data['move'] += 1
        print(json.dumps({**mouse_data, **keyboard_data}))

def on_click(x, y, button, pressed):
    if tracking:
        if button == Button.left:
            if pressed:
                mouse_data['left_click'] += 1
        elif button == Button.right:
            if pressed:
                mouse_data['right_click'] += 1
        print(json.dumps({**mouse_data, **keyboard_data}))

def on_scroll(x, y, dx, dy):
    if tracking:
        mouse_data['scroll'] += 1
        print(json.dumps({**mouse_data, **keyboard_data}))

def on_key_press(key):
    if tracking:
        try:
            char_key = key.char
            if char_key in keyboard_data:
                keyboard_data[char_key] += 1
            else:
                keyboard_data[char_key] = 1

            # Print the updated data
            print(json.dumps({**mouse_data, 'keyboard': keyboard_data}))
        except AttributeError:
            # Ignore non-character keys
            pass


def stop_tracking():
    global tracking
    tracking = False
    total_count = [
        mouse_data['left_click'],
        mouse_data['right_click'],
        mouse_data['move'],
        mouse_data['scroll'],
        sum(keyboard_data.values())
    ]
    print(json.dumps({'mouse': total_count}))

    mouse_data.update({
        'left_click': 0,
        'right_click': 0,
        'move': 0,
        'scroll': 0
    })
    keyboard_data.clear()

def start_tracking():
    global tracking
    tracking = True

def on_start_signal():
    start_tracking()

with MouseListener(on_move=on_move, on_click=on_click, on_scroll=on_scroll) as mouse_listener:
    with KeyboardListener(on_press=on_key_press) as keyboard_listener:
        while True:
            while not tracking:
                pass

            mouse_listener.join()
            keyboard_listener.join()
            on_start_signal()
