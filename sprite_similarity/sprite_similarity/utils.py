from functools import wraps
import logging
import sys
import time
from pathlib import Path

# from IPython.display import clear_output
# import ipyplot
# import matplotlib.pyplot as plt


DEFAULT_LOGGER = "performance"

def setup_logger(logs_path, logger_name=DEFAULT_LOGGER, quiet=False):
    logs_path = Path(logs_path)
    logs_path.mkdir(exist_ok=True, parents=True)

    logger = logging.getLogger(logger_name)
    logger.handlers.clear()

    log_file_path = logs_path / f"{logger_name}.log"
    log_format = logging.Formatter('%(name)s @ %(asctime)s [%(levelname)s] : %(message)s')

    file_handler = logging.FileHandler(log_file_path.as_posix(), mode='w')
    file_handler.setFormatter(log_format)

    if not quiet:
        logger.addHandler(logging.StreamHandler(sys.stdout))
        
    logger.addHandler(file_handler)
    logger.setLevel(logging.INFO)

    return logger

def walltimeit(func):
    
    # check this works properly - setup default logger if not already created
    if not logging.getLogger(DEFAULT_LOGGER).hasHandlers():
        setup_logger("./log")
    
    @wraps(func)
    def timed(*args, **kw):
        t0 = time.time()
        output = func(*args, **kw)
        t1 = time.time()
        
        logger = logging.getLogger(DEFAULT_LOGGER)
        msg = {
            'function': func.__name__,
            'time': t1 - t0,
        }
        #if func.__name__ == "applyMasks":
        #    msg['num_masks'] = len(args[1])
        log_msg = "WALLTIME {}".format(msg)
        logger.info(log_msg)
        
        return output
    
    return timed

# def watchit(func, names):
    
#     @wraps(func)
#     def monitored(*args, **kw):
#         imgs = func(*args, **kw)
        
#         if type(imgs) is tuple and imgs[0] is None:
#             pass
#         else:
#             clear_output(wait=True)
#             time.sleep(0.1)
#             ipyplot.plot_images(imgs, names)
#             time.sleep(1)
#         return imgs
    
#     return monitored