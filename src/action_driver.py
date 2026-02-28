from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException
from selenium.webdriver.common.by import By
import traceback


class ActionDriver:

    def __init__(self, driver, timeout=30, poll_frequency=0.5):
        self.driver = driver
        self.timeout = timeout
        self.poll = poll_frequency

    def wait(self):
        return WebDriverWait(
            self.driver,
            self.timeout,
            poll_frequency=self.poll
        )

    def wait_for_visibility(self, locator):
        try:
            print(f"⏳ Waiting for visibility: {locator}")
            return self.wait().until(
                EC.visibility_of_element_located(locator)
            )
        except TimeoutException:
            self.fail(f"Element not visible: {locator}")

    def wait_for_presence(self, locator, timeout=None):
        try:
            wait_timeout = timeout or self.timeout
            print(f"⏳ Waiting for presence: {locator}")
            return WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                EC.presence_of_element_located(locator)
            )
        except TimeoutException:
            self.fail(f"Element not present: {locator}")

    def wait_for_clickable(self, locator):
        try:
            print(f"⏳ Waiting for clickable: {locator}")
            return self.wait().until(
                EC.element_to_be_clickable(locator)
            )
        except TimeoutException:
            self.fail(f"Element not clickable: {locator}")

    def wait_for_element_to_disappear(self, locator, timeout=None):
        """Wait for element to disappear from DOM"""
        try:
            wait_timeout = timeout or self.timeout
            print(f"⏳ Waiting for element to disappear: {locator}")
            WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                EC.invisibility_of_element_located(locator)
            )
            print(f"✅ Element disappeared: {locator}")
        except TimeoutException:
            print(f"⚠️ Element still present (may be expected): {locator}")

    def wait_for_text_in_element(self, locator, text, timeout=None):
        """Wait for specific text to appear in element"""
        try:
            wait_timeout = timeout or self.timeout
            print(f"⏳ Waiting for text '{text}' in element: {locator}")
            element = self.wait_for_visibility(locator)
            WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                lambda d: text in element.text
            )
            print(f"✅ Text found in element: {locator}")
            return element
        except TimeoutException:
            self.fail(f"Text '{text}' not found in element: {locator}")

    def wait_for_url_change(self, current_url, timeout=None):
        """Wait for URL to change from current URL"""
        try:
            wait_timeout = timeout or self.timeout
            print(f"⏳ Waiting for URL to change from: {current_url}")
            WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                lambda d: d.current_url != current_url
            )
            print(f"✅ URL changed to: {self.driver.current_url}")
        except TimeoutException:
            print(f"⚠️ URL did not change (may be expected)")

    def wait_for_url_contains(self, url_part, timeout=None):
        """Wait for URL to contain specific part"""
        try:
            wait_timeout = timeout or self.timeout
            print(f"⏳ Waiting for URL to contain: {url_part}")
            WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                lambda d: url_part in d.current_url
            )
            print(f"✅ URL contains: {url_part}")
        except TimeoutException:
            self.fail(f"URL does not contain '{url_part}'")

    def wait_for_navigation(self, action_func, timeout=None):
        """Wait for navigation to complete after performing an action"""
        try:
            wait_timeout = timeout or self.timeout
            current_url = self.driver.current_url
            print(f"⏳ Waiting for navigation after action")
            
            # Perform the action
            action_func()
            
            # Wait for URL to change or page to load
            WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                lambda d: d.current_url != current_url or d.execute_script("return document.readyState") == "complete"
            )
            self.wait_for_page_load()
            self.wait_for_ajax()
            print(f"✅ Navigation completed")
        except TimeoutException:
            print(f"⚠️ Navigation may not have occurred")

    def wait_for_staleness(self, element, timeout=None):
        """Wait for element to become stale (removed from DOM)"""
        try:
            wait_timeout = timeout or self.timeout
            print(f"⏳ Waiting for element to become stale")
            WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                EC.staleness_of(element)
            )
            print(f"✅ Element became stale")
        except TimeoutException:
            print(f"⚠️ Element did not become stale (may be expected)")

    def wait_for_element_count(self, locator, expected_count, timeout=None):
        """Wait for specific number of elements to be present"""
        try:
            wait_timeout = timeout or self.timeout
            print(f"⏳ Waiting for {expected_count} elements: {locator}")
            WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                lambda d: len(d.find_elements(*locator)) == expected_count
            )
            print(f"✅ Found {expected_count} elements: {locator}")
        except TimeoutException:
            self.fail(f"Expected {expected_count} elements but found different count: {locator}")

    def wait_for_attribute_value(self, locator, attribute, value, timeout=None):
        """Wait for element attribute to have specific value"""
        try:
            wait_timeout = timeout or self.timeout
            print(f"⏳ Waiting for attribute '{attribute}' to be '{value}': {locator}")
            element = self.wait_for_presence(locator)
            WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                lambda d: element.get_attribute(attribute) == value
            )
            print(f"✅ Attribute '{attribute}' is '{value}': {locator}")
            return element
        except TimeoutException:
            self.fail(f"Attribute '{attribute}' did not become '{value}': {locator}")

    def safe_click(self, locator, max_retries=3):
        """Click element with retry logic for stale element references"""
        for attempt in range(max_retries):
            try:
                element = self.wait_for_clickable(locator)
                self.driver.execute_script(
                    "arguments[0].scrollIntoView({block:'center'});",
                    element
                )
                try:
                    element.click()
                    print(f"✅ Clicked: {locator}")
                    # Wait for any navigation or DOM changes after click
                    self.wait_for_ajax()
                    return
                except StaleElementReferenceException:
                    if attempt < max_retries - 1:
                        print(f"⚠️ Stale element reference, retrying ({attempt + 1}/{max_retries}): {locator}")
                        continue
                    else:
                        # Last attempt - re-find element and use JavaScript click
                        print(f"⚠️ Stale element, using JavaScript click: {locator}")
                        element = self.wait_for_presence(locator)
                        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
                        self.driver.execute_script("arguments[0].click();", element)
                        print(f"✅ Clicked via JavaScript: {locator}")
                        self.wait_for_ajax()
                        return
                except Exception as click_error:
                    # If regular click fails (e.g., element intercepted), try JavaScript click
                    if "click intercepted" in str(click_error).lower() or "ElementClickInterceptedException" in str(type(click_error).__name__):
                        print(f"⚠️ Regular click intercepted, using JavaScript click: {locator}")
                        # Re-find element in case it's stale
                        element = self.wait_for_presence(locator)
                        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
                        self.driver.execute_script("arguments[0].click();", element)
                        print(f"✅ Clicked via JavaScript: {locator}")
                        self.wait_for_ajax()
                        return
                    else:
                        raise
            except StaleElementReferenceException:
                if attempt < max_retries - 1:
                    print(f"⚠️ Stale element during wait, retrying ({attempt + 1}/{max_retries}): {locator}")
                    continue
                else:
                    raise
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"⚠️ Click failed, retrying ({attempt + 1}/{max_retries}): {locator}")
                    continue
                else:
                    self.fail(f"Click failed after {max_retries} attempts: {locator}", e)

    def safe_send_keys(self, locator, value):
        try:
            element = self.wait_for_visibility(locator)
            element.clear()
            element.send_keys(value)
            print(f"✅ Entered text into {locator}")
            # Wait for any validation or changes after input
            self.wait_for_ajax()
        except Exception as e:
            self.fail(f"Send keys failed: {locator}", e)

    def wait_for_page_load(self):
        try:
            self.wait().until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            print("✅ Page fully loaded")
        except TimeoutException:
            self.fail("Page load timeout")

    def wait_for_ajax(self):
        """Wait for AJAX/jQuery calls to complete"""
        try:
            self.wait().until(
                lambda d: d.execute_script(
                    "return window.jQuery == undefined || jQuery.active == 0"
                )
            )
            print("✅ AJAX calls completed")
        except TimeoutException:
            print("⚠️ AJAX wait timeout (may not be using jQuery)")

    def wait_for_angular(self, timeout=None):
        """Wait for Angular applications to be ready"""
        try:
            wait_timeout = timeout or self.timeout
            print("⏳ Waiting for Angular to be ready")
            WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                lambda d: d.execute_script(
                    "return window.angular === undefined || "
                    "angular.element(document.body).injector().get('$http').pendingRequests.length === 0"
                )
            )
            print("✅ Angular ready")
        except TimeoutException:
            print("⚠️ Angular wait timeout (may not be using Angular)")

    def wait_for_react(self, timeout=None):
        """Wait for React applications to be ready"""
        try:
            wait_timeout = timeout or self.timeout
            print("⏳ Waiting for React to be ready")
            WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                lambda d: d.execute_script(
                    "return window.React === undefined || "
                    "document.querySelector('[data-reactroot]') !== null"
                )
            )
            print("✅ React ready")
        except TimeoutException:
            print("⚠️ React wait timeout (may not be using React)")

    def wait_for_js_complete(self, timeout=None):
        """Wait for all JavaScript to complete execution"""
        try:
            wait_timeout = timeout or self.timeout
            print("⏳ Waiting for JavaScript to complete")
            WebDriverWait(self.driver, wait_timeout, poll_frequency=self.poll).until(
                lambda d: d.execute_script("return document.readyState") == "complete" and
                         d.execute_script("return window.jQuery === undefined || jQuery.active === 0")
            )
            print("✅ JavaScript execution completed")
        except TimeoutException:
            print("⚠️ JavaScript wait timeout")

    def wait_after_action(self, action_func, wait_type="ajax"):
        """Perform action and wait for appropriate condition"""
        current_url = self.driver.current_url
        
        # Perform the action
        result = action_func()
        
        # Wait based on type
        if wait_type == "navigation":
            self.wait_for_url_change(current_url, timeout=10)
        elif wait_type == "ajax":
            self.wait_for_ajax()
        elif wait_type == "page_load":
            self.wait_for_page_load()
        elif wait_type == "js":
            self.wait_for_js_complete()
        else:
            # Default: wait for page load and AJAX
            self.wait_for_page_load()
            self.wait_for_ajax()
        
        return result

    def fail(self, message, exception=None):
        print("❌ TEST FAILED:", message)
        if exception:
            traceback.print_exc()
        raise AssertionError(message)
