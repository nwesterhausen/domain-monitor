package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/nwesterhausen/domain-monitor/views/layout"
)

type BaseHandler struct {
	IncludeConfiguration bool
}

func (bh *BaseHandler) HandlerShowBase(c echo.Context) error {
	return View(c, layout.Base(bh.IncludeConfiguration))
}
